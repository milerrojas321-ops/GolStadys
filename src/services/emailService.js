/**
 * Función para enviar el código de verificación al usuario usando la API REST de Brevo
 */
export const enviarCodigoVerificacion = async (correoUsuario, codigo) => {
    try {
        const response = await fetch('https://api.brevo.com/v1/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // 👈 Lee la variable limpia de Railway
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    name: "GolStadys", 
                    email: "milerrojas321@gmail.com" // Tu correo verificado en Brevo
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
            })
        });

        // 🔥 CONTROL DE ERRORES MEJORADO PARA DETECTAR EL RECHAZO DE API
        if (!response.ok) {
            const textoError = await response.text(); // Captura la respuesta como texto plano para evitar el crash de JSON
            throw new Error(`Brevo rechazó la petición: ${textoError}`);
        }

        const data = await response.json();
        console.log('📨 Correo enviado con éxito usando la API de Brevo. ID:', data.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error en el servicio de correo Brevo API:', error.message);
        return false;
    }
};