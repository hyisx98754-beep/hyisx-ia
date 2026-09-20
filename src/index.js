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


            /*
             * IMPORTANTE:
             * La conversación se envía como mensajes reales
             * con roles separados.
             *
             * Esto evita que la IA invente líneas de
             * "Usuario:" y "IA:" dentro de su respuesta.
             */

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
                    .slice(-12)
                    .map(item => ({

                        role:
                            item.role,

                        content:
                            item.content

                    }));


            const messages = [

                {
                    role: "system",

                    content:
                        "Eres IA, la inteligencia artificial " +
                        "de conversación de HYISX. " +

                        "Tu función es solamente conversar " +
                        "con el usuario. " +

                        "Responde de forma natural, clara y útil. " +

                        "Habla principalmente en español si el " +
                        "usuario escribe en español. " +

                        "MUY IMPORTANTE: nunca inventes mensajes " +
                        "del usuario. " +

                        "Nunca escribas mensajes empezando por " +
                        "\"Usuario:\". " +

                        "Nunca escribas mensajes empezando por " +
                        "\"IA:\" como si estuvieras simulando " +
                        "varios turnos. " +

                        "Responde únicamente al último mensaje " +
                        "real del usuario. " +

                        "No continúes conversaciones inventadas. " +

                        "No afirmes que el usuario dijo algo que " +
                        "no aparece en la conversación recibida. " +

                        "El marcador \"b6y\" puede utilizarse " +
                        "como una marca de que un mensaje pertenece " +
                        "al usuario, pero nunca debes inventarlo " +
                        "ni usarlo para crear mensajes nuevos."

                },

                ...recentHistory,

                {
                    role: "user",

                    content: message

                }

            ];


            const result =
                await env.AI.run(
                    MODEL,
                    {
                        messages,
                        max_tokens: 300,
                        temperature: 0.5
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
