'use strict'
import { generarRespuesta } from './ai.service.js'
import Service from '../fields/services/services.model.js'
import Category from '../fields/categories/categories.model.js'
import Review from '../fields/reviews/reviews.model.js'

export const chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body
        if(!message) return res.status(400).json({ success: false, message: 'message es requerido' })

        const query = message.toLowerCase()
        let dbContext = {}

        // --- FILTRADO INTELIGENTE (Ahorro de Tokens) ---
        if (query.includes('mejor') || query.includes('calificado') || query.includes('estrella')) {
            // Solo traemos los servicios con sus reseñas para comparar
            dbContext.reviews = await Review.find().limit(5).lean()
            dbContext.services = await Service.find().sort({ rating: -1 }).limit(5).lean()
        } 
        else if (query.includes('categoría') || query.includes('que hay')) {
            dbContext.categories = await Category.find().lean()
        }
        else {
            // Busqueda general: solo traemos servicios básicos para no saturar
            dbContext.services = await Service.find().limit(10).lean()
        }

        // --- SYSTEM PROMPT ESTRICTO (Formato JSON) ---
        const systemPrompt = `
            Eres el asistente del "Directorio de Servicios de Guatemala".
            USA ESTA DATA PARA RESPONDER: ${JSON.stringify(dbContext)}

            INSTRUCCIONES OBLIGATORIAS:
            1. Responde ÚNICAMENTE en formato JSON.
            2. Si no encuentras algo, pon "hay_resultados": false.
            3. Si encuentras algo, pon los detalles en "lista_resultados".

            ESTRUCTURA DEL JSON:
            {
              "mensaje_ia": "Texto amable de respuesta",
              "hay_resultados": boolean,
              "lista_resultados": [],
              "sugerencia": "Consejo adicional"
            }
        `

        const responseText = await generarRespuesta(`${systemPrompt}\n\nUsuario: ${message}`)
        
        // Intentamos parsear la respuesta para asegurar que sea JSON puro
        const jsonResponse = JSON.parse(responseText.replace(/```json|```/g, ""))

        return res.json({
            success: true,
            ...jsonResponse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error con el agente',
            error: error.message
        })
    }
}