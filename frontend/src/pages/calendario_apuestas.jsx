import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import './calendario_apuestas.css';

function CalendarioApuestas({ torneoId }) {
  const [jornadaActiva, setJornadaActiva] = useState(1);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [predicciones, setPredicciones] = useState({});

  // Estados para datos de la base de datos
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Función reutilizable para extraer el ID de usuario de forma segura
  const obtenerIdUsuarioSeguro = () => {
    const tokenGolstadys = localStorage.getItem('token_golstadys');
    if (!tokenGolstadys) return null;

    try {
      // Caso 1: Si es un objeto JSON (como tu sesión actual)
      if (tokenGolstadys.startsWith('{')) {
        const objetoUsuario = JSON.parse(tokenGolstadys);
        return parseInt(objetoUsuario.id_usuario, 10);
      } 
      // Caso 2: Formato viejo con guiones bajos (ej: USER_ID_4)
      const partes = tokenGolstadys.split('_');
      if (partes.length >= 3) {
        return parseInt(partes[2], 10);
      } else if (partes.length === 2) {
        return parseInt(partes[1], 10);
      }
      // Caso 3: ID plano numérico
      const IDPlano = parseInt(tokenGolstadys, 10);
      return isNaN(IDPlano) ? null : IDPlano;
    } catch (error) {
      console.error("❌ Error al procesar el token_golstadys:", error);
      return null;
    }
  };

  // Cargar partidos del backend y cruzarlos con las apuestas existentes del usuario
  useEffect(() => {
    const cargarPartidosYApuestas = async () => {
      try {
        setCargando(true);

        // 1. Traer los partidos del torneo normalmente
        const respuestaPartidos = await fetch(`https://golstadys-production.up.railway.app/api/partidos/${torneoId}`);
        const datosPartidos = await respuestaPartidos.json();

        // 2. Extraer el ID del usuario actual de forma segura
        const idUsuarioReal = obtenerIdUsuarioSeguro();

        // 3. Si hay un usuario logueado, consultar si tiene apuestas registradas en la BD
        let apuestasUsuario = [];
        if (idUsuarioReal && !isNaN(idUsuarioReal)) {
          try {
            const respuestaApuestas = await fetch(`https://golstadys-production.up.railway.app/api/apuestas/usuario/${idUsuarioReal}`);
            if (respuestaApuestas.ok) {
              apuestasUsuario = await respuestaApuestas.json();
            }
          } catch (err) {
            console.error('⚠️ No se pudieron obtener las apuestas previas del usuario:', err);
          }
        }

        // 4. 🔥 CRUCE DE DATOS: Inicializar inputs y prevenir duplicidad visual
        const mapaInicialPredicciones = {};

        const partidosCruzados = datosPartidos.map((partido) => {
          const apuestaEncontrada = apuestasUsuario.find(a => a.id_partido === partido.id_partido);

          if (apuestaEncontrada) {
            // Sincronizamos el mapa de inputs del estado global
            mapaInicialPredicciones[partido.id_partido] = {
              local: apuestaEncontrada.prediccion_goles_local.toString(),
              visitante: apuestaEncontrada.prediccion_goles_visitante.toString()
            };

            return {
              ...partido,
              estado_partido: 'pronosticado', 
              goles_local_real: apuestaEncontrada.prediccion_goles_local,     
              goles_visitante_real: apuestaEncontrada.prediccion_goles_visitante 
            };
          }
          return partido; 
        });

        setPredicciones(mapaInicialPredicciones);
        setPartidos(partidosCruzados);
        setCargando(false);
      } catch (error) {
        console.error('Error al cargar la estructura del fixture:', error);
        setCargando(false);
      }
    };

    if (torneoId) {
      cargarPartidosYApuestas();
    }
  }, [torneoId]);

  const abrirPanelApuesta = (partido) => {
  setPartidoSeleccionado(partido);

  // Si no es undefined ni tampoco es null, lo hacemos texto de forma segura. Si es null, ponemos un campo vacío ''
  const golesLocalSeguros = partido.goles_local_real !== undefined && partido.goles_local_real !== null 
    ? partido.goles_local_real.toString() 
    : '';

  const golesVisitanteSeguros = partido.goles_visitante_real !== undefined && partido.goles_visitante_real !== null 
    ? partido.goles_visitante_real.toString() 
    : '';

  setPredicciones(prev => ({
    ...prev,
    [partido.id_partido]: {
      local: golesLocalSeguros,
      visitante: golesVisitanteSeguros
    }
  }));
};

  const cerrarPanelApuesta = () => setPartidoSeleccionado(null);

  const handleInputChange = (partidoId, bando, valor) => {
    if (valor !== '' && !/^\d+$/.test(valor)) return;
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [bando]: valor }
    }));
  };

  const guardarCambiosApuesta = async (partido) => {
    const golesLocal = predicciones[partido.id_partido]?.local;
    const golesVisitante = predicciones[partido.id_partido]?.visitante;

    if (golesLocal === undefined || golesLocal === '' || golesVisitante === undefined || golesVisitante === '') {
      alert('⚠️ Por favor, ingresa los goles para ambos equipos antes de fijar el marcador.');
      return;
    }

    // Extraer ID con nuestro validador inteligente para evitar el envío de nulos
    const idUsuarioReal = obtenerIdUsuarioSeguro();

    if (!idUsuarioReal || isNaN(idUsuarioReal)) {
      alert('Error: Tu sesión ha expirado o es inválida. Cierra sesión y vuelve a entrar a GolStadys.');
      console.error("❌ Error: id_usuario inválido en localStorage.");
      return;
    }

    const numGolesLocal = parseInt(golesLocal, 10);
    const numGolesVisitante = parseInt(golesVisitante, 10);

    let tendenciaCalculada = 'E';
    if (numGolesLocal > numGolesVisitante) {
      tendenciaCalculada = 'L';
    } else if (numGolesLocal < numGolesVisitante) {
      tendenciaCalculada = 'V';
    }

    const datosApuesta = {
      id_usuario: idUsuarioReal, 
      id_partido: partido.id_partido,
      prediccion_goles_local: numGolesLocal,
      prediccion_goles_visitante: numGolesVisitante,
      tendencia_predicha: tendenciaCalculada
    };

    try {
      const respuesta = await fetch('https://golstadys-production.up.railway.app/api/apuestas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosApuesta),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        console.log(`Apuesta procesada con éxito para el id_usuario: ${idUsuarioReal}`);

        // Modificar localmente el estado del partido en la lista sin duplicar la tarjeta
        setPartidos(prevPartidos => 
          prevPartidos.map(p => 
            p.id_partido === partido.id_partido 
              ? { ...p, estado_partido: 'pronosticado', goles_local_real: numGolesLocal, goles_visitante_real: numGolesVisitante } 
              : p
          )
        );

        cerrarPanelApuesta();
      } else {
        alert(`Error al guardar: ${resultado.mensaje || 'Respuesta inválida'}`);
      }
    } catch (error) {
      console.error('Error de red al guardar la apuesta:', error);
      alert('Error al conectar con el servidor backend.');
    }
  };

  if (cargando) {
    return (
      <div className="contenedor-calendario-apuestas" style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>
        <p>Cargando fixture y partidos de GolStadys...</p>
      </div>
    );
  }

  return (
    <div className="contenedor-calendario-apuestas animacion-entrada-suave">
      <div className="cronograma-fechas-nav">
        {[1, 2, 3].map((numFecha) => (
          <button
            key={numFecha}
            className={`pestana-jornada-premium ${jornadaActiva === numFecha ? 'activa' : ''}`}
            onClick={() => { setJornadaActiva(numFecha); cerrarPanelApuesta(); }}
          >
            <span className="sub-jornada">Fase de Grupos</span>
            <span className="titulo-jornada">Fecha #{numFecha}</span>
          </button>
        ))}
      </div>

      <div className="lista-encuentros-fixture-scroll">
        {partidos.length > 0 ? (
          partidos.map((partido) => {
            const yaPronosticado = partido.estado_partido === 'pronosticado';
            const fechaFormateada = new Date(partido.fecha_hora).toLocaleDateString('es-ES', {
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'UTC'
            });

            return (
              <div key={partido.id_partido} className={`tarjeta-partido-fixture ${yaPronosticado ? 'tarjeta-completada' : ''}`}>
                <div className="partido-meta-top">
                  <span className="badge-fecha-hora" style={{ textTransform: 'capitalize' }}>
                    {fechaFormateada}
                  </span>
                  <span className="badge-estadio">🏟️ Estadio Oficial</span>
                </div>

                <div className="bloque-enfrentamiento-marcador">
                  <div className="bando-equipo-compacto local">
                    <span className="nombre-pais-estadio">{partido.nombre_local}</span>
                    <div className="contenedor-bandera-compacta">
                      <img 
                        src={partido.bandera_local || '/src/assets/banderas/default.png'} 
                        alt={partido.nombre_local} 
                        className="imagen-bandera-redonda" 
                        onError={(e) => { e.target.src = '/src/assets/banderas/default.png'; }}
                      />
                    </div>
                  </div>

                  <div className="zona-marcador-preview">
                    <span className="marcador-num">{yaPronosticado ? partido.goles_local_real : '-'}</span>
                    <div className="separador-vs-compacto">VS</div>
                    <span className="marcador-num">{yaPronosticado ? partido.goles_visitante_real : '-'}</span>
                  </div>

                  <div className="bando-equipo-compacto visitante">
                    <div className="contenedor-bandera-compacta">
                      <img 
                        src={partido.bandera_visitante || '/src/assets/banderas/default.png'} 
                        alt={partido.nombre_visitante} 
                        className="imagen-bandera-redonda" 
                        onError={(e) => { e.target.src = '/src/assets/banderas/default.png'; }}
                      />
                    </div>
                    <span className="nombre-pais-estadio">{partido.nombre_visitante}</span>
                  </div>
                </div>

                <div className="partido-acciones-footer">
                  {/*VALIDACIÓN DE CIERRE: Si el partido ya tiene marcador oficial, se bloquea por completo */}
                  {partido.goles_local !== null && partido.goles_visitante !== null ? (
                    <button className="boton-registrar-apuesta-neon" disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: '#334155', boxShadow: 'none' }}>
                      Partido Finalizado
                    </button>
                  ) : (
                    <button className="boton-registrar-apuesta-neon" onClick={() => abrirPanelApuesta(partido)}>
                      {yaPronosticado ? 'Editar Pronóstico' : 'Apostar!!!'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="vista-modulo-vacio-calendario" style={{ marginTop: '20px', color: '#718096' }}>
            No hay partidos cargados para este torneo en la base de datos.
          </div>
        )}
      </div>

      {partidoSeleccionado && createPortal(
        <div className="drawer-overlay-backdrop" onClick={cerrarPanelApuesta}>
          <div className="drawer-lateral-premium-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header-top">
              <h3>Registrar Pronóstico</h3>
              <button className="boton-cerrar-drawer-x" onClick={cerrarPanelApuesta}>&times;</button>
            </div>
            <div className="drawer-body-info">
              <div className="caja-formulario-apuesta-drawer">
                <div className="bando-drawer-interactive local">
                  <div className="avatar-bandera-gigante">
                    <img src={partidoSeleccionado.bandera_local || '/src/assets/banderas/default.png'} 
                    alt={partidoSeleccionado.nombre_local} 
                    onError={(e) => { e.target.src = '/src/assets/banderas/default.png'; }} />
                  </div>
                  <span className="nombre-pais-drawer">{partidoSeleccionado.nombre_local}</span>
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="-"
                    value={predicciones[partidoSeleccionado.id_partido]?.local || ''}
                    onChange={(e) => handleInputChange(partidoSeleccionado.id_partido, 'local', e.target.value)}
                    className="input-goles-drawer-neon"
                  />
                </div>

                <div className="vs-intermedio-drawer">VS</div>

                <div className="bando-drawer-interactive visitante">
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="-"
                    value={predicciones[partidoSeleccionado.id_partido]?.visitante || ''}
                    onChange={(e) => handleInputChange(partidoSeleccionado.id_partido, 'visitante', e.target.value)}
                    className="input-goles-drawer-neon"
                  />
                  <span className="nombre-pais-drawer">{partidoSeleccionado.nombre_visitante}</span>
                  <div className="avatar-bandera-gigante">
                    <img src={partidoSeleccionado.bandera_visitante || '/src/assets/banderas/default.png'} 
                    alt={partidoSeleccionado.nombre_visitante} 
                    onError={(e) => { e.target.src = '/src/assets/banderas/default.png'; }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="drawer-footer-actions">
              <button className="boton-guardar-drawer-neon" onClick={() => guardarCambiosApuesta(partidoSeleccionado)}>
                Fijar Marcador
              </button>
              <button className="boton-cancelar-drawer" onClick={cerrarPanelApuesta}>Cancelar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CalendarioApuestas;