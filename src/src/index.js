
const MODEL = "@cf/meta/llama-3.2-3b-instruct";

export default {

    async fetch(request, env) {

        const headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };


        if (request.method === "OPTIONS") {

            return new Response(null, {
                status: 204,
                headers
            });

        }


        if (request.method !== "POST") {

            return new Response(
                JSON.stringify({
                    message: "HYISX IA activa"
                }),
                {
                    status: 200,
                    headers
                }
            );

        }


        try {

            const body =
                await request.json();


            const message =
                typeof body.message === "string"
                    ? body.message.trim()
                    : "";


            const history =
                Array.isArray(body.history)
                    ? body.history
                    : [];


            if (!message) {

                return new Response(
                    JSON.stringify({
                        error: "Escribe un mensaje."
                    }),
                    {
                        status: 400,
                        headers
                    }
                );

            }


            if (message.length > 4000) {

                return new Response(
                    JSON.stringify({
                        error: "El mensaje es demasiado largo."
                    }),
                    {
                        status: 400,
                        headers
                    }
                );

            }


            const recentHistory =
                history
                    .filter(item =>
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string"
                    )
                    .slice(-10);


            let conversation = "";

            for (
                const item
                of recentHistory
            ) {

                const role =
                    item.role === "user"
                        ? "Usuario"
                        : "IA";


                conversation +=
                    `${role}: ${item.content}\n`;

            }


            const prompt =
                "Eres IA, la inteligencia artificial " +
                "de conversación de HYISX.\n" +
                "Responde de forma natural, clara y útil. " +
                "Habla principalmente en español cuando " +
                "el usuario escriba en español.\n\n" +

                conversation +

                `Usuario: ${message}\n` +
                "IA:";


            const result =
                await env.AI.run(
                    MODEL,
                    {
                        prompt,
                        max_tokens: 300,
                        temperature: 0.7
                    }
                );


            return new Response(
                JSON.stringify({
                    response:
                        result.response || ""
                }),
                {
                    status: 200,
                    headers
                }
            );


        } catch (error) {

            console.error(
                "HYISX IA ERROR:",
                error
            );


            return new Response(
                JSON.stringify({
                    error:
                        "No se pudo obtener una respuesta de la IA."
                }),
                {
                    status: 500,
                    headers
                }
            );

        }

    }

};

