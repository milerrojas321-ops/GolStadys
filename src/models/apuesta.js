// src/models/apuesta.js
import db from '../config/conexion_db.js';

const Apuesta = {
    // Obtener todas las apuestas de un usuario para cruzarlas en el frontend
    findByUsuario: async (id_usuario) => {
    try {
        const querySQL = `
            SELECT 
                a.id_partido, 
                a.prediccion_goles_local, 
                a.prediccion_goles_visitante,
                IFNULL(loc.nombre_seleccion, 'Equipo local no encontrado') AS equipo_local,
                IFNULL(vis.nombre_seleccion, 'Equipo visitante no encontrado') AS equipo_visitante
            FROM apuestas a
            LEFT JOIN partidos p ON a.id_partido = p.id_partido
            LEFT JOIN selecciones loc ON p.id_local = loc.id_seleccion
            LEFT JOIN selecciones vis ON p.id_visitante = vis.id_seleccion
            WHERE a.id_usuario = ?
        `;

        const [rows] = await db.query(querySQL, [id_usuario]);
        return rows; 
        
    } catch (error) {
        console.error("❌ Error interno en SQL findByUsuario:", error);
        throw error;
    }
},

    // Buscar la información completa del partido (Evita el error is not a function)
    getTiempoPartido: async (id_partido) => {
        const [rows] = await db.query(
            'SELECT * FROM partidos WHERE id_partido = ?',
            [id_partido]
        );
        return rows[0]; // Retorna la fila del partido o undefined si no existe
    },

    // Crear o actualizar un pronóstico de forma atómica (INSERT ... ON DUPLICATE KEY UPDATE)
    upsert: async (datos) => {
        const { 
            id_usuario, 
            id_partido, 
            prediccion_goles_local, 
            prediccion_goles_visitante, 
            tendencia_predicha 
        } = datos;

        const querySQL = `
            INSERT INTO apuestas 
                (id_usuario, id_partido, prediccion_goles_local, prediccion_goles_visitante, tendencia_predicha, estado_apuesta, puntos_ganados_apuesta) 
            VALUES (?, ?, ?, ?, ?, 'pendiente', 0)
            ON DUPLICATE KEY UPDATE 
                prediccion_goles_local = VALUES(prediccion_goles_local),
                prediccion_goles_visitante = VALUES(prediccion_goles_visitante),
                tendencia_predicha = VALUES(tendencia_predicha);
        `;

        const [result] = await db.query(querySQL, [
            id_usuario, 
            id_partido, 
            prediccion_goles_local, 
            prediccion_goles_visitante, 
            tendencia_predicha
        ]);
        return result;
    },


obtenerApuestasPorPartido: async (id_partido) => {
        const [rows] = await db.query(
            "SELECT * FROM apuestas WHERE id_partido = ? AND estado_apuesta = 'pendiente'",
            [id_partido]
        );
        return rows;
    },

    aplicarPuntuacion: async (id_apuesta, id_usuario, puntos) => {
        const connection = await db.getConnection(); 
        try {
            await connection.beginTransaction();

            // Guardamos los puntos. Para evitar que se vuelva a calcular (ya que quitamos el IS NULL),
            // le cambiamos el estado a 'finalizó' (con tilde, que es la que tu ENUM parece tener guardada)
            // O si prefieres ir a la segura total, usa 'finalizó' tal cual la tenías antes.
            await connection.query(
                "UPDATE apuestas SET puntos_ganados_apuesta = ?, estado_apuesta = 'finalizó' WHERE id_apuesta = ?",
                [puntos, id_apuesta]
            );

            // Sumar puntos al perfil global del usuario
            await connection.query(
                "UPDATE usuarios SET puntaje_total = puntaje_total + ? WHERE id_usuario = ?",
                [puntos, id_usuario]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

export default Apuesta;