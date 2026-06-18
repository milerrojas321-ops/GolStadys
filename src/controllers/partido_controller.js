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
    const { id_partido } = req.params;
    const { goles_local, goles_visitante } = req.body;

    // 1. Convertir estrictamente a números enteros
    const idPartidoInt = parseInt(id_partido, 10);
    const gLocalInt = parseInt(goles_local, 10);
    const gVisitanteInt = parseInt(goles_visitante, 10);

    console.log(`📥 [Admin] Registrando marcador para partido ${idPartidoInt}: ${gLocalInt}-${gVisitanteInt}`);

    // 2. Ejecutar la actualización del partido en la BD usando tu modelo nativo
    await Partido.actualizarResultado(idPartidoInt, gLocalInt, gVisitanteInt);
    console.log(`✅ [Base de Datos] Partido ${idPartidoInt} actualizado a 'finalizado'.`);

    // 3. EJECUTAR EL MOTOR DE PUNTOS INMEDIATAMENTE (Sin setImmediate para evitar que Railway lo mate)
    console.log(`🤖 [Motor] Iniciando cálculo analítico de puntos...`);
    
    const mockReq = {
      body: {
        id_partido: idPartidoInt,
        goles_local: gLocalInt,
        goles_visitante: gVisitanteInt
      }
    };

    // Objeto de respuesta simulado para capturar lo que haga el controlador de apuestas
    let respuestaMotor = '';
    const mockRes = {
      status: (codigo) => ({
        json: (data) => { respuestaMotor = data.mensaje; }
      })
    };

    // Forzamos la espera con await para que no se salte el proceso
    await calcularPuntosPartidos(mockReq, mockRes);
    console.log(`🎉 [Motor] Resultado del procesamiento: ${respuestaMotor}`);

    // 4. RESPONDER AL FRONTEND SÓLO CUANDO TODO EL TRABAJO HAYA TERMINADO
    return res.status(200).json({ 
      ok: true, 
      mensaje: `¡Marcador oficial asentado y puntos liquidados con éxito! (${respuestaMotor})` 
    });

  } catch (error) {
    console.error('❌ Error crítico en registrarMarcadorOficial:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor al cerrar el partido.' });
  }
};