// netlify/edge-functions/preguntarContador.js
export default async (request, context) => {
    // Si es una petición de tipo OPTIONS (CORS), responder rápido
    if (request.method === "OPTIONS") {
        return new Response("OK", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
    }

    try {
        const { systemPrompt } = await request.json();
        
        // Netlify leerá de forma segura tu API Key desde su panel web
        const apiKey = Netlify.env.get("GEMINI_API_KEY");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            }
        );

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error en el servidor de Netlify" }), { status: 500 });
    }
};

// Esto le dice a Netlify que cuando alguien vaya a /preguntarContador ejecute este archivo
export const config = { path: "/preguntarContador" };