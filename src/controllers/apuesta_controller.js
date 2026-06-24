import Apuesta from '../models/apuesta.js';

export const registrarApuesta = async (req, res) => {
  const { 
    id_usuario, 
    id_partido, 
    prediccion_goles_local, 
    prediccion_goles_visitante, 
    tendencia_predicha 
  } = req.body;

  try {
    // 1. Obtener los metadatos del partido desde el modelo
    const partidoReal = await Apuesta.getTiempoPartido(id_partido);

    if (!partidoReal) {
      return res.status(444).json({ ok: false, mensaje: 'El partido seleccionado no existe.' });
    }

    // 🔒 REGLA DE SEGURIDAD PRINCIPAL: Si ya tiene marcador oficial en la BD, rechazar de inmediato.
    // Usamos != null para capturar tanto null como undefined de forma segura.
    if (partidoReal.goles_local != null && partidoReal.goles_visitante != null) {
      return res.status(403).json({ 
        ok: false, 
        mensaje: 'Lo sentimos, este partido ya finalizó y sus apuestas están cerradas.' 
      });
    }

    // 2. CONTROL DE TIEMPO INTELIGENTE (Sincronizado con Hora Colombia)
    let momentoPartido;

    if (partidoReal.fecha_hora) {
      momentoPartido = new Date(partidoReal.fecha_hora);
    } else {
      const fechaCruda = partidoReal.fecha_partido || partidoReal.fecha;
      const horaCruda = partidoReal.hora_partido || partidoReal.hora;

      if (!fechaCruda || !horaCruda) {
        return res.status(500).json({ ok: false, mensaje: 'Error: No se encontraron las columnas de tiempo en la BD.' });
      }

      // Procesamiento seguro de strings de fecha
      const fechaISO = new Date(fechaCruda).toISOString().split('T')[0]; 
      const horaTexto = horaCruda != null ? horaCruda.toString() : "00:00:00"; 
      momentoPartido = new Date(`${fechaISO}T${horaTexto}`);
    }

    // 🇨🇴 OBTENER LA HORA ACTUAL EN ZONA HORARIA DE COLOMBIA
    const ahoraUTC = new Date();
    const momentoActualColombia = new Date(ahoraUTC.toLocaleString("en-US", { timeZone: "America/Bogota" }));

    // Ahora restamos el tiempo restante para iniciar el cotejo
    const diferenciaMinutos = (momentoPartido - momentoActualColombia) / (1000 * 60);

    // 🚨 REGLA DE NEGOCIO: Bloqueo por tiempo límite (30 minutos antes)
    if (diferenciaMinutos < 30) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Pronóstico bloqueado. No puedes fijar o editar marcadores a menos de 30 minutos del partido o si este ya comenzó.'
      });
    }

    // 3. Guardar o Modificar a través del Modelo si pasa los filtros corporativos
    await Apuesta.upsert({
      id_usuario,
      id_partido,
      prediccion_goles_local,
      prediccion_goles_visitante,
      tendencia_predicha
    });

    return res.status(200).json({
      ok: true,
      mensaje: '¡Pronóstico procesado y guardado correctamente!'
    });

  } catch (error) {
    console.error('Error en el controlador de apuestas:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al procesar tu pronóstico.'
    });
  }
};

export const obtenerApuestasUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const filas = await Apuesta.findByUsuario(id_usuario);

    // Si lo que viene no es un arreglo válido, forzamos un envío seguro
    if (!Array.isArray(filas)) {
      return res.status(200).json([]);
    }

    return res.status(200).json(filas);
  } catch (error) {
    console.error('Error al obtener las apuestas del usuario:', error);
    // 🟢 CLAVE: Respondemos con estatus 200 y array vacío para desbloquear el front mientras depuras el backend
    return res.status(200).json([]); 
  }
};

export const calcularPuntosPartidos = async (req, res) => {
  // 🔥 SOLUCIÓN EXTRACCIÓN: Busca el ID tanto en los parámetros de la URL como en el cuerpo de la petición
  const id_partido = req.body?.id_partido || req.params?.id_partido || req.params?.idPartido;
  
  // Captura flexible para los goles reales ingresados
  const goles_local = req.body?.goles_local !== undefined ? req.body.goles_local : req.body?.goles_local_real;
  const goles_visitante = req.body?.goles_visitante !== undefined ? req.body.goles_visitante : req.body?.goles_visitante_real;

  try {
    if (!id_partido) {
      console.log("❌ [Motor de Puntos] -> Error: No se recibió ningún id_partido válido.");
      return res.status(400).json({ ok: false, mensaje: 'ID de partido no proporcionado.' });
    }

    console.log(`[Motor de Puntos] -> Iniciando procesamiento para partido ID: ${id_partido}. Marcador oficial: ${goles_local}-${goles_visitante}`);

    // 1. Convertir los goles reales ingresados a números enteros
    const goles_local_real = parseInt(goles_local, 10);
    const goles_visitante_real = parseInt(goles_visitante, 10);

    // 2. Determinar matemáticamente la tendencia real del partido
    let tendenciaReal = 'E'; // Por defecto Empate
    if (goles_local_real > goles_visitante_real) tendenciaReal = 'L'; // Local
    if (goles_local_real < goles_visitante_real) tendenciaReal = 'V'; // Visitante

    // 3. Traer todas las apuestas pendientes de este partido específico
    const apuestasUsuarios = await Apuesta.obtenerApuestasPorPartido(id_partido);

    if (!apuestasUsuarios || apuestasUsuarios.length === 0) {
      console.log(`⚠️ [Motor de Puntos] -> No se encontraron apuestas con estado 'pendiente' para el partido ${id_partido}`);
      return res.status(200).json({
        ok: true,
        mensaje: 'Marcador registrado, pero no había apuestas con estado pendiente para este partido o el ID es inválido.'
      });
    }

    console.log(`🔥 [Motor de Puntos] -> Encontradas ${apuestasUsuarios.length} apuestas pendientes para procesar.`);

    // 4. Bucle analítico sobre cada apuesta individual
    for (const apuesta of apuestasUsuarios) {
      const pLocal = parseInt(apuesta.prediccion_goles_local, 10);
      const pVisitante = parseInt(apuesta.prediccion_goles_visitante, 10);

      // Determinar matemáticamente la tendencia que predijo el usuario si no venía de la BD
      let tendenciaPredicha = apuesta.tendencia_predicha;
      if (!tendenciaPredicha) {
        tendenciaPredicha = 'E';
        if (pLocal > pVisitante) tendenciaPredicha = 'L';
        if (pLocal < pVisitante) tendenciaPredicha = 'V';
      }

      let puntosGanados = 0;

      // 🥇 REGLA 1: Marcador idéntico perfecto (5 Puntos)
      if (pLocal === goles_local_real && pVisitante === goles_visitante_real) {
        puntosGanados = 5;
      } 
      // 🥈 REGLA 2: Acertó ganador/empate Y ADEMÁS los goles de uno de los dos equipos (3 Puntos)
      else if (tendenciaPredicha === tendenciaReal && (pLocal === goles_local_real || pVisitante === goles_visitante_real)) {
        puntosGanados = 3;
      } 
      // 🥉 REGLA 3: Acertó solo la tendencia general (2 Puntos)
      else if (tendenciaPredicha === tendenciaReal) {
        puntosGanados = 2;
      } 
      // ❌ REGLA 4: Falló por completo (0 Puntos)
      else {
        puntosGanados = 0;
      }

      console.log(`👤 Usuario ID ${apuesta.id_usuario} predijo ${pLocal}-${pVisitante}. Puntos asignados: ${puntosGanados}`);

      // 5. Persistir de forma atómica en la BD (Suma puntos al usuario y cierra la apuesta)
      await Apuesta.aplicarPuntuacion(apuesta.id_apuesta, apuesta.id_usuario, puntosGanados);
    }

    return res.status(200).json({
      ok: true,
      mensaje: `¡Cálculo analítico completado con éxito! Se liquidaron ${apuestasUsuarios.length} apuestas.`
    });

  } catch (error) {
    console.error('Error crítico en el motor de puntos:', error);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, mensaje: 'Error interno al calcular la puntuación.' });
    }
  }
};

// Dejamos un alias por si acaso tu partido_controller.js importa 'procesarPuntosPartido'
export const procesarPuntosPartido = calcularPuntosPartidos;