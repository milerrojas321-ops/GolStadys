// src/controllers/partido_controller.js
import Partido from '../models/partido_model.js';
import { calcularPuntosPartidos } from './apuesta_controller.js';

export const obtenerPartidosPorTorneo = async (req, res) => {
  try {
    const { id_torneo } = req.params;
    const partidos = await Partido.obtenerPorTorneo(id_torneo);
    res.json(partidos);
  } catch (error) {
    console.error('Error en partido_controller:', error);
    res.status(500).json({ mensaje: 'Error al obtener los partidos' });
  }
};

export const getPartidosPorTorneo = async (req, res) => {
  try {
    const { torneoId } = req.params;

    // Validación básica del parámetro por seguridad
    if (!torneoId) {
      return res.status(400).json({ mensaje: "El ID del torneo es requerido." });
    }

    // Llamamos al modelo para interactuar con MySQL
    const fixture = await Partido.obtenerPorTorneo(torneoId);

    // Si el torneo no tiene partidos, devolvemos un arreglo vacío de forma segura
    res.json(fixture);
  } catch (error) {
    console.error("❌ Error en getPartidosPorTorneo Control:", error);
    res.status(500).json({ 
      mensaje: "Error interno del servidor al procesar el fixture de GolStadys." 
    });
  }
};

export const obtenerTodosLosPartidos = async (req, res) => {
  try {
    const partidos = await Partido.obtenerTodos();
    res.json(partidos);
  } catch (error) {
    console.error('Error al obtener todos los partidos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al mapear partidos' });
  }
};

export const obtenerTodasLasSelecciones = async (req, res) => {
  try {
    const selecciones = await Partido.obtenerSelecciones();
    res.json(selecciones);
  } catch (error) {
    console.error('Error al mapear selecciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener equipos' });
  }
};

//CONTROLADOR: Inserta un nuevo partido en estado programado
export const crearNuevoPartido = async (req, res) => {
  try {
    // Mapeamos lo que manda el formulario (id_campeonato) al campo real (id_torneo)
    const { id_campeonato, id_local, id_visitante, fecha_hora } = req.body;
    
    if (!id_campeonato || !id_local || !id_visitante || !fecha_hora) {
      return res.status(400).json({ mensaje: 'Campos obligatorios faltantes en la carga' });
    }

    const resultado = await Partido.crear({
      id_torneo: id_campeonato,
      id_local,
      id_visitante,
      fecha_hora
    });

    res.status(201).json({ mensaje: 'Partido inyectado exitosamente', id_partido: resultado.insertId });
  } catch (error) {
    console.error('Error al crear nuevo partido:', error);
    res.status(500).json({ mensaje: 'Fallo crítico al insertar el partido en la base de datos' });
  }
};

export const registrarMarcadorOficial = async (req, res) => {
  try {
    // 1.CORREGIDO: id_partido viene de los parámetros de la URL (:id_partido)
    const { id_partido } = req.params; 
    // Los goles sí vienen del cuerpo del formulario
    const { goles_local, goles_visitante } = req.body;

    // Validación de seguridad para que no intente ejecutar datos vacíos
    if (id_partido === undefined || goles_local === undefined || goles_visitante === undefined) {
      return res.status(400).json({ 
        ok: false, 
        mensaje: 'Faltan parámetros requeridos (id_partido, goles_local o goles_visitante).' 
      });
    }

    const idPartidoInt = parseInt(id_partido, 10);
    const gLocalInt = parseInt(goles_local, 10);
    const gVisitanteInt = parseInt(goles_visitante, 10);

    // 2. Ejecutar la actualización del partido en la BD usando tu modelo nativo
    await Partido.actualizarResultado(idPartidoInt, gLocalInt, gVisitanteInt);

    // 3. Responder de inmediato al Frontend para que pinte éxito en el dashboard
    res.status(200).json({ 
      ok: true, 
      mensaje: '¡Marcador oficial asentado en la base de datos con éxito!' 
    });

    // 4.DISPARAR EL MOTOR DE PUNTOS EN SEGUNDO PLANO
    // Emulamos el req y res para que apuesta_controller procese las puntuaciones sin trabar la UI
    setImmediate(async () => {
      try {
        const mockReq = {
          body: {
            id_partido: idPartidoInt,
            goles_local: gLocalInt,
            goles_visitante: gVisitanteInt
          }
        };
        
        const mockRes = {
          status: () => ({ 
            json: (data) => console.log(`🤖 [Motor de Puntos] -> ${data.mensaje}`) 
          })
        };

        await calcularPuntosPartidos(mockReq, mockRes);
      } catch (errorPuntos) {
        console.error('Error en el background worker de puntuación:', errorPuntos);
      }
    });

  } catch (error) {
    console.error('Error crítico en registrarMarcadorOficial:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        ok: false, 
        mensaje: 'Fallo crítico al insertar el marcador en la base de datos.' 
      });
    }
  }
};