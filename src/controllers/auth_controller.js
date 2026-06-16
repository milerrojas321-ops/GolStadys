import { enviarCodigoVerificacion } from '../services/emailService.js'; // Añadido el .js al final
import Usuario from '../models/usuario.js';

// 1. Solicitar Código (Exportado correctamente)
export const solicitarCodigo = async (req, res) => {
    const { correo } = req.body; 

    if (!correo) {
        return res.status(400).json({ ok: false, msg: 'El correo es obligatorio' });
    }

    try {
        // Verificar si el usuario ya existe en GolStadys
        let usuario = await Usuario.findByEmail(correo);

        // Si no existe, lo registramos automáticamente (rol por defecto: jugador)
        if (!usuario) {
            await Usuario.create(correo);
        }

        // Generar un código aleatorio de 6 dígitos
        const codigoGenerado = Math.floor(100000 + Math.random() * 900000);

        // MODELO: Guardar el código en tu tabla de usuarios con su expiración
        await Usuario.guardarCodigoTemporal(correo, codigoGenerado);

        // SERVICIO: Enviar el correo real usando Nodemailer y Brevo
        const correoEnviado = await enviarCodigoVerificacion(correo, codigoGenerado);

        if (!correoEnviado) {
            return res.status(500).json({ ok: false, msg: 'Error al enviar el correo con el código' });
        }

        return res.status(200).json({ 
            ok: true, 
            msg: 'Código de verificación enviado con éxito.' 
        });

    } catch (error) {
        console.error('Error en solicitarCodigo Controlador:', error);
        return res.status(500).json({ ok: false, msg: 'Error interno en el servidor' });
    }
};

// 2. Verificar Código
export const verificarCodigo = async (req, res) => {
    // Sincronizado con el body que envía el front (correo_electronico y codigo_otp)
    const { correo_electronico, codigo_otp } = req.body; 
    
    if (!correo_electronico || !codigo_otp) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    try {
        // Verificar OTP válido en la base de datos
        const usuario = await Usuario.verifyOTP(correo_electronico, codigo_otp);
        if (!usuario) {
            return res.status(400).json({ error: 'El código es incorrecto o ya expiró.' });
        }

        // Limpiar el OTP ya usado para que no se pueda reutilizar
        await Usuario.updateOTP(usuario.id_usuario, null, null);

        // EVALUACIÓN CLAVE: ¿Tiene el nombre vacío en la base de datos?
        const requiereRegistroCompleto = !usuario.nombre_completo;

        // Responder incluyendo los datos del usuario y la bandera de perfil
        return res.status(200).json({
            message: 'Código verificado con éxito.',
            token: `token_sesion_${usuario.id_usuario}_${usuario.rol}`,
            requiereRegistroCompleto: requiereRegistroCompleto, // <- ¡Esto le avisa a React!
            usuario: {
                id: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error en verificarCodigo:', error);
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

// 4. Obtener Ranking
export const obtenerRanking = async (req, res) => {
    try {
        const ranking = await Usuario.obtenerRankingGlobal();
        return res.status(200).json(ranking);
    } catch (error) {
        console.error('❌ Error al compilar el ranking:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error al recuperar la tabla de posiciones.' });
    }
};