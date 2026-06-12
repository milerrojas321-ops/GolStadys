import db from '../config/conexion_db.js'; // Nombre real de tu archivo config

const Torneo = {
  obtenerTodos: async () => {
    // Columnas reales tomadas de tu captura de phpMyAdmin
    const [filas] = await db.query('SELECT id, nombre, categoria, estado, premio_pool, popularidad, logo FROM torneos');
    return filas;
  }
};

export default Torneo;

