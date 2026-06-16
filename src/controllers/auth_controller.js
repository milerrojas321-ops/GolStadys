import Usuario from '../models/usuario.js';

// Importamos el servicio de correo que creaste
const { enviarCodigoVerificacion } = require('../services/emailService');
// Importamos el modelo para interactuar con la base de datos
const AuthModel = require('../models/auth_model');

const solicitarCodigo = async (req, res) => {
    const { correo } = req.body; // Viene de la Vista

    if (!correo) {
        return res.status(400).json({ ok: false, msg: 'El correo es obligatorio' });
    }

    try {
        // 1. Generar un código aleatorio de 6 dígitos
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000);

        // 2. MODELO: Guardar el código en la base de datos MySQL para verificarlo luego
        await AuthModel.guardarCodigoTemporal(correo, codigoGenerado);

        // 3. SERVICIO: Enviar el correo usando el código de Nodemailer
        const correoEnviado = await enviarCodigoVerificacion(correo, codigoGenerado);

        if (!correoEnviado) {
            return res.status(500).json({ ok: false, msg: 'Error al enviar el correo con el código' });
        }

        // 4. Responder con éxito a la Vista
        return res.status(200).json({ 
            ok: true, 
            msg: 'Código de verificación enviado con éxito.' 
        });

    } catch (error) {
        console.error('Error en solicitarCodigo Controlador:', error);
        return res.status(500).json({ ok: false, msg: 'Error interno en el servidor' });
    }
};

module.exports = {
    solicitarCodigo
};