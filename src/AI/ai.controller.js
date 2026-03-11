'use strict'
import { generarRespuesta } from './ai.service.js'
import Service from '../fields/services/services.model.js' // Importa tu modelo de servicios

export const chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body

        if(!message) return res.status(400).json({ success: false, message: 'message es requerido' })

        // 1. Obtener TODOS los servicios de tu base de datos para darle contexto a la IA
        // Tip: En un proyecto real filtrarías por categoría, pero para Kinal podemos pasarle la lista
        const dbServices = await Service.find().lean()

        // 2. Construir el "System Prompt" (Las instrucciones de comportamiento)
        const context = `
            Eres el asistente virtual del "Directorio de Servicios de Guatemala". 
            Tu base de datos actual es la siguiente:
            ${JSON.stringify(dbServices)}

            REGLAS:
            1. Si el usuario pide un servicio (ej. plomero, carpintero), busca en la lista de arriba.
            2. Si encuentras coincidencias, da el nombre del profesional y su contacto.
            3. SI NO HAY un servicio en la lista, dile: "Lo siento, actualmente no contamos con ese servicio en nuestro directorio".
            4. No menciones redes sociales ni búsquedas externas.
        `

        // 3. Unir el contexto con la pregunta real del usuario
        const fullPrompt = `${context}\n\nPregunta del usuario: ${message}`

        // 4. Llamar a la función que ya tenías (la de Groq o Gemini)
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