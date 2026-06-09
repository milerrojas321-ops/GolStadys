import Usuario from '../models/usuario.js';

// 1. Solicitar Código
export const solicitarCodigo = async (req, res) => {
    const { correo_electronico } = req.body;
    if (!correo_electronico) return res.status(400).json({ error: 'El correo electrónico es requerido.' });

    try {
        let usuario = await Usuario.findByEmail(correo_electronico);
        let esNuevo = false;

        if (!usuario) {
            const nuevoId = await Usuario.create(correo_electronico);
            usuario = { id_usuario: nuevoId, correo_electronico, nombre_completo: null };
            esNuevo = true;
        }

        const codigoOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const ahora = new Date();
        const otpExpiracion = new Date(ahora.getTime() + 5 * 60 * 1000);

        await Usuario.updateOTP(usuario.id_usuario, codigoOtp, otpExpiracion);
        console.log(`\n📩 [CORREO ENVIADO A: ${correo_electronico}] | CÓDIGO OTP: ${codigoOtp}\n`);

        return res.status(200).json({
            message: 'Código OTP generado con éxito.',
            requiereRegistroCompleto: esNuevo || usuario.nombre_completo === null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 2. Verificar Código
export const verificarCodigo = async (req, res) => {
    const { correo_electronico, codigo_otp } = req.body;
    if (!correo_electronico || !codigo_otp) return res.status(400).json({ error: 'Todos los campos son requeridos.' });

    try {
        const usuario = await Usuario.verifyOTP(correo_electronico, codigo_otp);
        if (!usuario) return res.status(400).json({ error: 'El código es incorrecto o ya expiró.' });

        // Limpiar OTP usado
        await Usuario.updateOTP(usuario.id_usuario, null, null);

        return res.status(200).json({
            message: 'Código verificado con éxito.',
            token: `token_sesion_${usuario.id_usuario}_${usuario.rol}` // Aquí mapeas el rol de forma dinámica
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. Completar Perfil (Nombre)
export const completarPerfil = async (req, res) => {
    const { correo_electronico, nombre_completo } = req.body;
    if (!correo_electronico || !nombre_completo) return res.status(400).json({ error: 'El nombre completo es requerido.' });

    try {
        const actualizado = await Usuario.updatePerfil(correo_electronico, nombre_completo);
        if (!actualizado) return res.status(400).json({ error: 'No se pudo actualizar el perfil.' });

        return res.status(200).json({ message: 'Perfil guardado con éxito.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};