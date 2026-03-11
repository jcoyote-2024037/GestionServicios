'use strict'
import { generarRespuesta } from './ai.service.js'
// Importamos todas las entidades de tu captura
import Service from '../fields/services/services.model.js'
import Category from '../fields/categories/categories.model.js'
import Review from '../fields/reviews/reviews.model.js'
import Location from '../fields/location/location.model.js'

export const chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body
        if(!message) return res.status(400).json({ success: false, message: 'message es requerido' })

        // 1. Obtenemos toda la data en paralelo para no perder tiempo
        const [services, categories, reviews, locations] = await Promise.all([
            Service.find().lean(),
            Category.find().lean(),
            Review.find().lean(),
            Location.find().lean()
        ])

        // 2. Construimos un contexto masivo con todas las entidades
        const context = `
            Eres el asistente experto del "Directorio de Servicios de Guatemala". 
            Tienes acceso a toda la base de datos del sistema:

            SERVICIOS DISPONIBLES: ${JSON.stringify(services)}
            CATEGORÍAS: ${JSON.stringify(categories)}
            RESEÑAS Y CALIFICACIONES: ${JSON.stringify(reviews)}
            UBICACIONES: ${JSON.stringify(locations)}

            REGLAS DE RESPUESTA:
            1. Si piden "los mejores", busca en RESEÑAS y cruza los datos con SERVICIOS.
            2. Si piden servicios por zona, busca en UBICACIONES.
            3. Si piden categorías, usa la lista de CATEGORÍAS.
            4. Si algo NO existe en estas listas, di: "No cuento con esa información en el directorio".
            5. Responde de forma amable y profesional.
        `

        const fullPrompt = `${context}\n\nPregunta del usuario: ${message}`
        const response = await generarRespuesta(fullPrompt)

        return res.json({
            success: true,
            response
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error con el agente',
            error: error.message
        })
    }
}