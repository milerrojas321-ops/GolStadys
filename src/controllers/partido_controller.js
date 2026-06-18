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
  const { id_partido } = req.params;
  const { goles_local, goles_visitante } = req.body;

  try {
    // Convertir a enteros para asegurar que no viajen como texto
    const idPartidoInt = parseInt(id_partido, 10);
    const gLocalInt = parseInt(goles_local, 10);
    const gVisitanteInt = parseInt(goles_visitante, 10);

    // 1. Actualizar el partido en la BD
    await Partido.actualizarResultado(idPartidoInt, gLocalInt, gVisitanteInt);

    // 2. Disparar el motor de puntos de forma segura
    setImmediate(async () => {
      try {
        // Creamos el objeto exactamente como lo espera calcularPuntosPartidos
        const mockReq = {
          body: {
            id_partido: idPartidoInt,
            goles_local: gLocalInt,         // 🎯 Nombre exacto que lee tu apuesta_controller
            goles_visitante: gVisitanteInt,   // 🎯 Nombre exacto que lee tu apuesta_controller
            goles_local_real: gLocalInt,    // Por respaldo
            goles_visitante_real: gVisitanteInt // Por respaldo
          }
        };

        const mockRes = {
          status: () => ({ json: (data) => console.log("🤖 [Motor Puntos] Respuesta:", data) })
        };

        console.log(`🚀 [Backend] Disparando motor de puntos para el partido ${idPartidoInt}`);
        
        // Llamamos a la función unificada que arreglamos en el paso anterior
        await calcularPuntosPartidos(mockReq, mockRes);

      } catch (err) {
        console.error("❌ Error crítico dentro del proceso setImmediate:", err);
      }
    });

    return res.status(200).json({ 
      ok: true, 
      mensaje: 'Marcador oficial registrado. El motor de puntos se está ejecutando en segundo plano.' 
    });

  } catch (error) {
    console.error('❌ Error en registrarMarcadorOficial:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
  }
};