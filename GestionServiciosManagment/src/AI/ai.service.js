import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1", // Esto conecta con Groq
});

export const generarRespuesta = async (prompt) => {
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Error con el agente Groq:", error);
        throw error;
    }
};