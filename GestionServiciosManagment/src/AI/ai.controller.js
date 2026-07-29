'use strict'
import { generarRespuesta } from './ai.service.js'
import Service from '../fields/services/services.model.js'
import Category from '../fields/categories/categories.model.js'
import Review from '../fields/reviews/reviews.model.js'
import Location from '../fields/location/location.model.js'

export const chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body
        if(!message) return res.status(400).json({ success: false, message: 'message es requerido' })

        const query = message.toLowerCase()
        let dbContext = {}
        const userName = req.user?.name || 'Usuario'

        if (query.includes('mejor') || query.includes('calificado') || query.includes('estrella') || query.includes('top')) {
            dbContext.services = await Service.find({ estado: 'activo' })
                .sort({ averageRating: -1 })
                .populate('categoriaId', 'nombre')
                .limit(5)
                .lean()
        }
        else if (query.includes('categoria') || query.includes('categoría') || query.includes('que hay') || query.includes('disponible')) {
            dbContext.categories = await Category.find({ estado: true }).lean()
            dbContext.services = await Service.find({ estado: 'activo' })
                .populate('categoriaId', 'nombre')
                .limit(10)
                .lean()
        }
        else if (query.includes('cerca') || query.includes('cercano') || query.includes('ubicacion') || query.includes('ubicación') || query.includes('donde')) {
            const userLoc = req.user?.municipality || req.user?.department
            if (userLoc) {
                const locations = await Location.find({
                    $or: [
                        { municipality: { $regex: userLoc, $options: 'i' } },
                        { department: { $regex: userLoc, $options: 'i' } }
                    ]
                }).lean()
                const locIds = locations.map(l => l._id)
                dbContext.services = await Service.find({ locationId: { $in: locIds }, estado: 'activo' })
                    .populate('locationId')
                    .populate('categoriaId', 'nombre')
                    .limit(10)
                    .lean()
            } else {
                dbContext.services = await Service.find({ estado: 'activo' })
                    .populate('categoriaId', 'nombre')
                    .limit(10)
                    .lean()
            }
        }
        else {
            dbContext.services = await Service.find({ estado: 'activo' })
                .populate('categoriaId', 'nombre')
                .limit(10)
                .lean()
        }

        const dbContextJson = JSON.stringify(dbContext).substring(0, 3000)

        const systemPrompt = `
Eres el asistente virtual de "Directorio de Servicios de Guatemala", una plataforma donde usuarios encuentran y contratan servicios locales.
Te llamas "GestionBot" y respondes de forma amable, clara y servicial en español.

DATOS ACTUALES DEL CONTEXTO: ${dbContextJson}

INSTRUCCIONES ESTRICTAS:
1. Responde SIEMPRE en formato JSON, sin texto adicional.
2. Si hay servicios en el contexto y son relevantes, pon "hay_resultados": true y COPIA los objetos COMPLETOS en "lista_resultados" (con _id, nombre, categoriaId).
3. "mensaje_ia" debe ser SOLO un saludo breve. NO incluyas nombres de servicios en el texto.
4. Si no hay datos relevantes, pon "hay_resultados": false.

FORMATO JSON ESTRICTO:
{
  "mensaje_ia": "Saludo breve sin servicios",
  "hay_resultados": true,
  "lista_resultados": [...objetos del contexto...],
  "sugerencia": "Pregunta útil relacionada"
}

Ejemplo CORRECTO: {"mensaje_ia": "¡Claro, ${userName}! Aquí tienes:", "hay_resultados": true, "lista_resultados": [...], "sugerencia": "¿Quieres ver más detalles?"}
Ejemplo INCORRECTO: {"mensaje_ia": "Claro! Tenemos Servicio A, Servicio B...", "hay_resultados": false} - NUNCA pongas servicios en mensaje_ia
        `

        const fullPrompt = `${systemPrompt}\n\nUsuario (${userName}): ${message}`
        const responseText = await generarRespuesta(fullPrompt)

        let jsonResponse
        try {
            const cleaned = responseText
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim()
            jsonResponse = JSON.parse(cleaned)
        } catch {
            jsonResponse = {
                mensaje_ia: responseText.substring(0, 500),
                hay_resultados: false,
                lista_resultados: [],
                sugerencia: '¿Quieres preguntar por servicios disponibles o categorías?'
            }
        }

        if (dbContext.services?.length > 0) {
            const aiNames = (jsonResponse.lista_resultados || [])
                .map(s => (s.nombre || s.name || '').toLowerCase().trim())
                .filter(Boolean)
            jsonResponse.lista_resultados = aiNames.length > 0
                ? dbContext.services.filter(s => aiNames.includes((s.nombre || s.name || '').toLowerCase().trim()))
                : dbContext.services
            if (jsonResponse.lista_resultados.length > 0) {
                jsonResponse.hay_resultados = true
            }
        }

        return res.json({
            success: true,
            ...jsonResponse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lo siento, tuve un problema interno. Intenta de nuevo en unos segundos.',
            error: error.message
        })
    }
}
