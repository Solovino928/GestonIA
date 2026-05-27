const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true }); 

// Ya no declaramos { secrets: [...] } para que corra en el plan gratis
exports.preguntarContador = onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send({ error: "Método no permitido" });
        }

        try {
            const { systemPrompt } = req.body;
            if (!systemPrompt) {
                return res.status(400).send({ error: "Falta el prompt" });
            }

            // Leemos la variable normal del entorno
            const apiKey = process.env.GEMINI_API_KEY;

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
            return res.status(200).send(data);

        } catch (error) {
            return res.status(500).send({ error: "Error interno en el servidor de Firebase" });
        }
    });
});