import pool from '../config/conexion_db.js';

const Usuario = {
    // Buscar un usuario por su correo electrónico
    findByEmail: async (correo) => {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE correo_electronico = ?', 
            [correo]
        );
        return rows[0];
    },

    // Crear un nuevo usuario (solo con su correo, rol por defecto jugador)
    create: async (correo) => {
        const [result] = await pool.query(
            'INSERT INTO usuarios (correo_electronico, rol) VALUES (?, "jugador")',
            [correo]
        );
        return result.insertId;
    },

    // Actualizar el código OTP y su fecha de expiración
    updateOTP: async (id, codigo, expiracion) => {
        const [result] = await pool.query(
            'UPDATE usuarios SET codigo_otp = ?, otp_expiracion = ? WHERE id_usuario = ?',
            [codigo, expiracion, id]
        );
        return result.affectedRows > 0;
    },

    // Verificar OTP válido y que no haya expirado
    verifyOTP: async (correo, codigo) => {
        const [rows] = await pool.query(
            `SELECT * FROM usuarios 
             WHERE correo_electronico = ? 
             AND codigo_otp = ? 
             AND otp_expiracion > NOW()`, 
            [correo, codigo]
        );
        return rows[0];
    },

    // Guardar el nombre completo del perfil
    updatePerfil: async (correo, nombre) => {
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre_completo = ? WHERE correo_electronico = ?',
            [nombre, correo]
        );
        return result.affectedRows > 0;
    }
};

export default Usuario;