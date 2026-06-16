import nodemailer from 'nodemailer';

// 1. Configurar el transportador con los datos de Brevo que guardamos en el .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // false para puerto 587 (usa TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verificación opcional en consola para saber que la conexión con Brevo está OK
transporter.verify((error, success) => {
    if (error) {
        console.log('Error de conexión con Brevo SMTP:', error);
    } else {
        console.log('Servidor de correos listo para enviar mensajes');
    }
});

/**
 * Función para enviar el código de verificación al usuario
 */
export const enviarCodigoVerificacion = async (correoUsuario, codigo) => {
    try {
        const opciones = {
            from: '"GolStadys" <milerrojas321@gmail.com>',
            to: correoUsuario,                              // Destinatario
            subject: 'Tu código de verificación - GolStadys', // Asunto
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>¡Bienvenido a GolStadys!</h2>
                    <p>Usa el siguiente código para completar tu inicio de sesión:</p>
                    <h1 style="color: #4A90E2; letter-spacing: 5px; font-size: 32px;">${codigo}</h1>
                    <p>Este código es confidencial y vence en unos minutos.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(opciones);
        console.log('Correo enviado con éxito. ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error al enviar el correo con Nodemailer:', error);
        return false;
    }
};