export const enviarCodigoVerificacion = async (correoUsuario, codigo) => {
    try {
        const response = await fetch('https://api.brevo.com/v1/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': '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', // 👈
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    name: "GolStadys", 
                    email: "milerrojas321@gmail.com"
                },
                to: [
                    { 
                        email: correoUsuario
                    }
                ],
                subject: 'Tu código de verificación - GolStadys', //
                htmlContent: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>¡Bienvenido a GolStadys!</h2>
                        <p>Usa el siguiente código para completar tu inicio de sesión:</p>
                        <h1 style="color: #4A90E2; letter-spacing: 5px; font-size: 32px;">${codigo}</h1>
                        <p>Este código es confidencial y vence en unos minutos.</p>
                    </div>
                ` // Conservamos tu hermoso diseño de correo
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al enviar por la API de Brevo');
        }

        console.log('📨 Correo enviado con éxito usando la API de Brevo. ID:', data.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error al enviar el correo con la API de Brevo:', error.message);
        return false;
    }
};