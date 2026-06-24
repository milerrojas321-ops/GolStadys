import db from '../config/conexion_db.js';

const Partido = {
  obtenerPorTorneo: async (torneoId) => {
    const query = `
      SELECT 
        p.id_partido,
        p.id_torneo,
        p.fecha_hora,
        p.goles_local_real,
        p.goles_visitante_real,
        p.estado_partido,
        sl.nombre_seleccion AS nombre_local,
        sl.url_bandera AS bandera_local,
        sv.nombre_seleccion AS nombre_visitante,
        sv.url_bandera AS bandera_visitante
      FROM partidos p
      INNER JOIN selecciones sl ON p.id_local = sl.id_seleccion
      INNER JOIN selecciones sv ON p.id_visitante = sv.id_seleccion
      WHERE p.id_torneo = ?
      ORDER BY p.fecha_hora ASC
    `;
    const [rows] = await db.query(query, [torneoId]);
    return rows;
  },

  obtenerTodos: async () => {
    const querySQL = `
      SELECT 
        p.id_partido,
        p.id_torneo,
        p.fecha_hora,
        p.goles_local_real,
        p.goles_visitante_real,
        p.estado_partido,
        sl.nombre_seleccion AS nombre_local,
        sl.url_bandera AS bandera_local,
        sv.nombre_seleccion AS nombre_visitante,
        sv.url_bandera AS bandera_visitante
      FROM partidos p
      INNER JOIN selecciones sl ON p.id_local = sl.id_seleccion
      INNER JOIN selecciones sv ON p.id_visitante = sv.id_seleccion
      ORDER BY p.fecha_hora ASC;
    `;
    const [rows] = await db.query(querySQL);
    return rows;
  },

  obtenerSelecciones: async () => {
    const querySQL = "SELECT id_seleccion, nombre_seleccion, url_bandera FROM selecciones ORDER BY nombre_seleccion ASC";
    const [rows] = await db.query(querySQL);
    return rows;
  },

  crear: async (datos) => {
    const querySQL = `
      INSERT INTO partidos (id_torneo, id_local, id_visitante, fecha_hora, estado_partido)
      VALUES (?, ?, ?, ?, 'programado')
    `;
    const [resultado] = await db.query(querySQL, [
      datos.id_torneo,
      datos.id_local,
      datos.id_visitante,
      datos.fecha_hora
    ]);
    return resultado;
  },

  actualizarResultado: async (idPartido, golesLocal, golesVisitante) => {
    const querySQL = `
      UPDATE partidos 
      SET goles_local_real = ?, goles_visitante_real = ?, estado_partido = 'finalizado'
      WHERE id_partido = ?
    `;
    const [resultado] = await db.query(querySQL, [golesLocal, golesVisitante, idPartido]);
    return resultado;
  }
};

export default Partido;