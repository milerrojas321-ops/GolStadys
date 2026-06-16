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

    // 2. CONTROL DE TIEMPO INTELIGENTE (Para columnas combinadas como fecha_hora o individuales)
    let momentoPartido;

    if (partidoReal.fecha_hora) {
      // Si usas un campo DATETIME/TIMESTAMP único en MySQL
      momentoPartido = new Date(partidoReal.fecha_hora);
    } else {
      // Por si acaso maneja campos separados (fecha y hora)
      const fechaCruda = partidoReal.fecha_partido || partidoReal.fecha;
      const horaCruda = partidoReal.hora_partido || partidoReal.hora;

      if (!fechaCruda || !horaCruda) {
        return res.status(500).json({ ok: false, mensaje: 'Error: No se encontraron las columnas de tiempo en la BD.' });
      }

      const fechaISO = new Date(fechaCruda).toISOString().split('T')[0]; 
      const horaTexto = typeof horaCruda === 'string' ? horaCruda : horaCruda.toString(); 
      momentoPartido = new Date(`${fechaISO}T${horaTexto}`);
    }

    const momentoActual = new Date();

    // Calcular la diferencia exacta expresada en horas reales
    const diferenciaHoras = (momentoPartido - momentoActual) / (1000 * 60 * 60);

    // //  REGLA DE NEGOCIO: Bloqueo a menos de 2 horas del partido
    // if (diferenciaHoras < 2) {
    //   return res.status(400).json({
    //     ok: false,
    //     mensaje: 'Pronóstico bloqueado. No puedes fijar o editar marcadores a menos de 2 horas del partido.'
    //   });
    // }

    // 3. Guardar o Modificar a través del Modelo si pasa el filtro de tiempo
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
  const { id_partido, goles_local, goles_visitante } = req.body;

  try {
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
      return res.status(200).json({
        ok: true,
        mensaje: 'Marcador registrado, pero no había apuestas pendientes para este partido.'
      });
    }

    // 4. Bucle analítico sobre cada apuesta individual
    for (const apuesta of apuestasUsuarios) {
      const pLocal = parseInt(apuesta.prediccion_goles_local, 10);
      const pVisitante = parseInt(apuesta.prediccion_goles_visitante, 10);

      // Determinar matemáticamente la tendencia que predijo el usuario
      let tendenciaPredicha = 'E';
      if (pLocal > pVisitante) tendenciaPredicha = 'L';
      if (pLocal < pVisitante) tendenciaPredicha = 'V';

      let puntosGanados = 0;

      // 🥇 REGLA 1: Marcador idéntico perfecto (5 Puntos) -> ¡Soporta empates como 5-5 o 0-0!
      if (pLocal === goles_local_real && pVisitante === goles_visitante_real) {
        puntosGanados = 5;
      } 
      // 🥈 REGLA 2: Acertó ganador/empate Y ADEMÁS los goles de uno de los dos equipos (3 Puntos)
      else if (tendenciaPredicha === tendenciaReal && (pLocal === goles_local_real || pVisitante === goles_visitante_real)) {
        puntosGanados = 3;
      } 
      // 🥉 REGLA 3: Acertó solo quién ganaba/perdía o empataba sin dar los goles exactos (1 Punto)
      else if (tendenciaPredicha === tendenciaReal) {
        puntosGanados = 1;
      } 
      // ❌ REGLA 4: Falló por completo (0 Puntos)
      else {
        puntosGanados = 0;
      }

      // 5. Persistir de forma atómica en la BD (Suma puntos al usuario y cierra la apuesta)
      await Apuesta.aplicarPuntuacion(apuesta.id_apuesta, apuesta.id_usuario, puntosGanados);
    }

    return res.status(200).json({
      ok: true,
      mensaje: `¡Cálculo analítico completado con éxito! Se procesaron ${apuestasUsuarios.length} apuestas.`
    });

  } catch (error) {
    console.error('❌ Error crítico en el motor de puntos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno al calcular la puntuación.' });
  }
};

export const procesarPuntosPartido = async (req, res) => {
  const { id_partido, goles_local_real, goles_visitante_real } = req.body;

  try {
    // 1. Buscar todas las apuestas que hicieron los usuarios para este partido
    const apuestasUsuarios = await Apuesta.obtenerApuestasPorPartido(id_partido);

    if (apuestasUsuarios.length === 0) {
      return res.status(200).json({ ok: true, mensaje: 'No hay apuestas pendientes por calcular en este partido.' });
    }

    // Determinar la tendencia real del partido (Gana Local, Gana Visitante o Empate)
    let tendenciaReal = 'E';
    if (goles_local_real > goles_visitante_real) tendenciaReal = 'L';
    if (goles_local_real < goles_visitante_real) tendenciaReal = 'V';

    // 2. Bucle inteligente para evaluar cada apuesta una por una
    for (const apuesta of apuestasUsuarios) {
      const pLocal = apuesta.prediccion_goles_local;
      const pVisitante = apuesta.prediccion_goles_visitante;
      const tendenciaPredicha = apuesta.tendencia_predicha; // 'L', 'V' o 'E'

      let puntosGanados = 0;

      // REGLA 1: Marcador idéntico y perfecto (5 Puntos)
      if (pLocal === goles_local_real && pVisitante === goles_visitante_real) {
        puntosGanados = 5;
      } 
      // REGLA 2: Adivinó el ganador/empate Y le pegó a los goles de AL MENOS un equipo (3 Puntos)
      else if (tendenciaPredicha === tendenciaReal && (pLocal === goles_local_real || pVisitante === goles_visitante_real)) {
        puntosGanados = 3;
      } 
      // REGLA 3: Solo adivinó la tendencia simple (Ganador o empate general) (2 Puntos)
      else if (tendenciaPredicha === tendenciaReal) {
        puntosGanados = 2;
      } 
      // REGLA 4: Falló por completo (0 Puntos)
      else {
        puntosGanados = 0;
      }

      // 3. Persistir los puntos calculados en la BD usando el modelo
      await Apuesta.aplicarPuntuacion(apuesta.id_apuesta, apuesta.id_usuario, puntosGanados);
    }

    return res.status(200).json({
      ok: true,
      mensaje: `¡Cerebro de puntuación ejecutado! Se procesaron ${apuestasUsuarios.length} apuestas correctamente.`
    });

  } catch (error) {
    console.error('Error en el cerebro de puntuación:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno al liquidar los puntos del partido.' });
  }
};