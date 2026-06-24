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
    if (!torneoId) {
      return res.status(400).json({ mensaje: "El ID del torneo es requerido." });
    }
    const fixture = await Partido.obtenerPorTorneo(torneoId);
    res.json(fixture);
  } catch (error) {
    console.error("Error en getPartidosPorTorneo Control:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

export const obtenerTodosLosPartidos = async (req, res) => {
  try {
    const partidos = await Partido.obtenerTodos();
    res.json(partidos);
  } catch (error) {
    console.error('Error al obtener todos los partidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los partidos' });
  }
};

export const crearNuevoPartido = async (req, res) => {
  try {
    const resultado = await Partido.crear(req.body);
    res.status(201).json({ id: resultado.insertId, mensaje: 'Partido creado exitosamente' });
  } catch (error) {
    console.error('Error al crear partido:', error);
    res.status(500).json({ mensaje: 'Error al crear el partido' });
  }
};

export const obtenerTodasLasSelecciones = async (req, res) => {
  try {
    const selecciones = await Partido.obtenerSelecciones();
    res.json(selecciones);
  } catch (error) {
    console.error('Error al obtener selecciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener las selecciones' });
  }
};

export const registrarMarcadorOficial = async (req, res) => {
  // Captura múltiple por si el parámetro viene de diferentes formas en la petición
  const id_partido = req.params.id_partido || req.params.idPartido || req.body.id_partido;
  const { goles_local, goles_visitante } = req.body;

  try {
    if (!id_partido) {
      return res.status(400).json({ ok: false, mensaje: 'El ID del partido es requerido.' });
    }

    const idPartidoInt = parseInt(id_partido, 10);
    const gLocalInt = parseInt(goles_local, 10);
    const gVisitanteInt = parseInt(goles_visitante, 10);

    console.log(`[Admin] [MVC] Actualizando Partido ${idPartidoInt} con marcador ${gLocalInt}-${gVisitanteInt}`);

    // 1. CAPA MODELO: Guardar el resultado real usando la función nativa del modelo Partido
    await Partido.actualizarResultado(idPartidoInt, gLocalInt, gVisitanteInt);

    // 2. CAPA CONTROLADOR CRUZADO: Preparar el entorno simulado para el motor analítico de puntos
    const mockReq = {
      body: {
        id_partido: idPartidoInt,
        goles_local: gLocalInt,
        goles_visitante: gVisitanteInt,
        goles_local_real: gLocalInt,
        goles_visitante_real: gVisitanteInt
      }
    };

    const mockRes = {
      status: () => ({
        json: (data) => console.log(`[Motor Puntos DB]: ${data.mensaje}`)
      })
    };

    // Forzamos el await para asegurar que Railway procese las apuestas antes de cerrar la petición del cliente
    await calcularPuntosPartidos(mockReq, mockRes);

    // 3. RESPUESTA (VISTA/JSON): Retornar confirmación exitosa al Frontend en Vercel
    return res.status(200).json({ 
      ok: true, 
      mensaje: '¡Marcador oficial registrado en el modelo y apuestas liquidadas exitosamente!' 
    });

  } catch (error) {
    console.error('Error crítico en registrarMarcadorOficial (MVC):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor al procesar el marcador.' });
  }
};