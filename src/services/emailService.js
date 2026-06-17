import https from 'https';

/**
 * Función para enviar el código de verificación usando el módulo nativo HTTPS de Node.js
 * Diseñado para evitar fallos de entorno en producción (Railway)
 */
export const enviarCodigoVerificacion = async (correoUsuario, codigo) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { 
                name: "GolStadys", 
                email: "milerrojas321@gmail.com" 
            },
            to: [
                { email: correoUsuario }
            ],
            subject: 'Tu código de verificación - GolStadys',
            htmlContent: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>¡Bienvenido a GolStadys!</h2>
                    <p>Usa el siguiente código para completar tu inicio de sesión:</p>
                    <h1 style="color: #4A90E2; letter-spacing: 5px; font-size: 32px;">${codigo}</h1>
                    <p>Este código es confidencial y vence en unos minutos.</p>
                </div>
            `
        });

        const opciones = {
            hostname: 'api.brevo.com',
            path: '/v1/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // 👈 Lee tu variable de Railway
                'content-type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(opciones, (res) => {
            let cuerpoRespuesta = '';

            res.on('data', (chunk) => {
                cuerpoRespuesta += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('📨 ¡Correo enviado con éxito por la API de Brevo!');
                    resolve(true);
                } else {
                    console.error(`❌ Brevo respondió con código ${res.statusCode}:`, cuerpoRespuesta);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Error de red en la petición HTTPS:', error.message);
            resolve(false);
        });

        // Escribir los datos en el cuerpo de la petición y finalizarla
        req.write(data);
        req.end();
    });
};