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
  // Captura el ID del partido desde los parámetros de la URL de forma segura
  const id_partido = req.params.id_partido || req.params.idPartido || req.body.id_partido;
  const { goles_local, goles_visitante } = req.body;

  try {
    if (!id_partido) {
      return res.status(400).json({ ok: false, mensaje: 'El ID del partido es requerido.' });
    }

    const idPartidoInt = parseInt(id_partido, 10);
    const gLocalInt = parseInt(goles_local, 10);
    const gVisitanteInt = parseInt(goles_visitante, 10);

    console.log(`[Admin] [MVC] Actualizando Partido Real ${idPartidoInt} con marcador ${gLocalInt}-${gVisitanteInt}`);

    // 1. 🏛️ CAPA MODELO: Guarda el resultado en la tabla partidos (goles_local_real, goles_visitante_real)
    await Partido.actualizarResultado(idPartidoInt, gLocalInt, gVisitanteInt);

    // 2. 🚀 CAPA CONTROLADOR CRUZADO: Preparamos el objeto req exacto que espera tu motor de puntos
    // Pasamos tanto la nomenclatura plana como la real de la BD para asegurar compatibilidad total
    const mockReq = {
      body: {
        id_partido: idPartidoInt,
        goles_local: gLocalInt,
        goles_visitante: gVisitanteInt,
        goles_local_real: gLocalInt,
        goles_visitante_real: gVisitanteInt
      }
    };

    // Objeto de respuesta simulado para capturar los logs del motor en Railway
    const mockRes = {
      status: function(code) {
        return {
          json: (data) => console.log(`[Motor Puntos - Status ${code}]: ${data.mensaje}`)
        };
      }
    };

    // Ejecutamos el motor de puntos esperando a que termine de actualizar la tabla de apuestas
    await calcularPuntosPartidos(mockReq, mockRes);

    // 3. 📤 RESPUESTA: Confirmación exitosa de fin de flujo
    return res.status(200).json({ 
      ok: true, 
      mensaje: '¡Marcador oficial registrado y tabla de apuestas recalculada con éxito!' 
    });

  } catch (error) {
    console.error('Error crítico en registrarMarcadorOficial (MVC):', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor al procesar el marcador.' });
  }
};