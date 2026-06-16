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

  // Cargar partidos del backend
  // Cargar partidos del backend y cruzarlos con las apuestas existentes del usuario
  useEffect(() => {
    const cargarPartidosYApuestas = async () => {
      try {
        setCargando(true);

        // 1. Traer los partidos del torneo normalmente
        const respuestaPartidos = await fetch(`https://golstadys-production.up.railway.app/api/partidos/${torneoId}`);
        const datosPartidos = await respuestaPartidos.json();

        // 2. Extraer el ID del usuario actual desde su token_golstadys
        const tokenGolstadys = localStorage.getItem('token_golstadys');
        let idUsuarioReal = null;

        if (tokenGolstadys) {
          const partes = tokenGolstadys.split('_');
          if (partes.length >= 3) {
            idUsuarioReal = parseInt(partes[2], 10);
          }
        }

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

        // 4. 🔥 CRUCE MÁGICO DE DATOS: Fusionar el fixture con las apuestas reales de la BD
        const partidosCruzados = datosPartidos.map((partido) => {
          // Buscamos si el usuario ya apostó en este partido
          const apuestaEncontrada = apuestasUsuario.find(a => a.id_partido === partido.id_partido);

          if (apuestaEncontrada) {
            return {
              ...partido,
              estado_partido: 'pronosticado', // Activa visualmente el modo "completado / editar"
              goles_local_real: apuestaEncontrada.prediccion_goles_local,     // Pinta sus goles guardados
              goles_visitante_real: apuestaEncontrada.prediccion_goles_visitante // Pinta sus goles guardados
            };
          }
          return partido; // Si no ha apostado, se deja el partido intacto ("Apostar!!!")
        });

        // Guardamos todo el fixture procesado en el estado
        setPartidos(partidosCruzados);
        setCargando(false);
      } catch (error) {
        console.error('❌ Error al cargar la estructura del fixture:', error);
        setCargando(false);
      }
    };

    if (torneoId) {
      cargarPartidosYApuestas();
    }
  }, [torneoId]);

  const abrirPanelApuesta = (partido) => {
    setPartidoSeleccionado(partido);
    
    // Si el partido ya tiene goles_local_real guardados del cruce de datos de la BD,
    // los precargamos en los inputs para que puedas editarlos cómodamente.
    setPredicciones(prev => ({
      ...prev,
      [partido.id_partido]: {
        local: partido.goles_local_real !== undefined ? partido.goles_local_real : '',
        visitante: partido.goles_visitante_real !== undefined ? partido.goles_visitante_real : ''
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

    // 1. Capturamos tu token real estructurado de la consola ('token_sesion_ID_rol')
    const tokenGolstadys = localStorage.getItem('token_golstadys');

    if (!tokenGolstadys) {
      alert('❌ Error: Sesión inválida o expirada. Por favor, vuelve a iniciar sesión en GolStadys.');
      return;
    }

    let idUsuarioReal = null;

    try {
      // 2. EXTRAER EL ID DINÁMICO DESDE EL STRING DEL TOKEN
      // Si el string es "token_sesion_2_jugador", al dividirlo por '_' obtenemos:
      // partes[0] = "token", partes[1] = "sesion", partes[2] = "2", partes[3] = "jugador"
      const partes = tokenGolstadys.split('_');
      if (partes.length >= 3) {
        idUsuarioReal = parseInt(partes[2], 10); // Tomamos la posición index 2 que es el ID numérico
      }
    } catch (e) {
      console.error("Error al procesar el token de GolStadys:", e);
    }

    // Validación por si el string del token llega a estar corrupto o vacío
    if (!idUsuarioReal || isNaN(idUsuarioReal)) {
      alert('❌ Error: No se pudo descifrar tu ID de jugador. Cierra sesión y vuelve a entrar.');
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

    // 3. Reestructuramos el JSON tal cual como lo espera recibir tu 'apuesta_controller.js'
    const datosApuesta = {
      id_usuario: idUsuarioReal, // Envía el ID exacto del usuario logueado (ej: 2)
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
        console.log(`✅ Apuesta guardada exitosamente para el id_usuario: ${idUsuarioReal}`);
        
        setPartidos(prevPartidos => 
          prevPartidos.map(p => 
            p.id_partido === partido.id_partido 
              ? { ...p, estado_partido: 'pronosticado', goles_local_real: numGolesLocal, goles_visitante_real: numGolesVisitante } 
              : p
          )
        );

        cerrarPanelApuesta();
      } else {
        alert(`❌ Error al guardar: ${resultado.mensaje || 'Respuesta inválida'}`);
      }
    } catch (error) {
      console.error('❌ Error de red al guardar la apuesta:', error);
      alert('❌ Error al conectar con el servidor backend.');
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
      
      {/* PESTAÑAS DE NAVEGACIÓN */}
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

      {/* LISTADO DE PARTIDOS EN VIVO DESDE MYSQL */}
      <div className="lista-encuentros-fixture-scroll">
        {partidos.length > 0 ? (
          partidos.map((partido) => {
            const yaPronosticado = partido.estado_partido === 'pronosticado';

            // Formateador premium para la fecha de MySQL
            const fechaFormateada = new Date(partido.fecha_hora).toLocaleDateString('es-ES', {
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              hour: '2-digit', 
              minute: '2-digit'
            });

            return (
              <div key={partido.id_partido} className={`tarjeta-partido-fixture ${yaPronosticado ? 'tarjeta-completada' : ''}`}>
                <div className="partido-meta-top">
                  <span className="badge-fecha-hora" style={{ textTransform: 'capitalize' }}>
                    📅 {fechaFormateada}
                  </span>
                  <span className="badge-estadio">🏟️ Estadio Oficial</span>
                </div>

                <div className="bloque-enfrentamiento-marcador">
                  {/* Equipo Local */}
                  <div className="bando-equipo-compacto local">
                    <span className="nombre-pais-estadio">{partido.nombre_local}</span>
                    <div className="contenedor-bandera-compacta">
                      <img 
                        src={partido.bandera_local || '/src/assets/banderas/default.png'} 
                        alt={partido.nombre_local} 
                        className="imagen-bandera-redonda" 
                        onError={(e) => { e.target.src = '⚽'; }} 
                      />
                    </div>
                  </div>

                  {/* Marcador Preview */}
                  <div className="zona-marcador-preview">
                    <span className="marcador-num">{yaPronosticado ? partido.goles_local_real : '-'}</span>
                    <div className="separador-vs-compacto">VS</div>
                    <span className="marcador-num">{yaPronosticado ? partido.goles_visitante_real : '-'}</span>
                  </div>

                  {/* Equipo Visitante */}
                  <div className="bando-equipo-compacto visitante">
                    <div className="contenedor-bandera-compacta">
                      <img 
                        src={partido.bandera_visitante || '/src/assets/banderas/default.png'} 
                        alt={partido.nombre_visitante} 
                        className="imagen-bandera-redonda" 
                        onError={(e) => { e.target.src = '⚽'; }} 
                      />
                    </div>
                    <span className="nombre-pais-estadio">{partido.nombre_visitante}</span>
                  </div>
                </div>

                <div className="partido-acciones-footer">
                  <button className="boton-registrar-apuesta-neon" onClick={() => abrirPanelApuesta(partido)}>
                    {yaPronosticado ? '🔄 Editar Pronóstico' : 'Apostar!!!'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="vista-modulo-vacio-calendario" style={{ marginTop: '20px', color: '#718096' }}>
            ⚙️ No hay partidos cargados para este torneo en la base de datos.
          </div>
        )}
      </div>

      {/* PORTAL AL BODY PARA EL MODAL */}
      {partidoSeleccionado && createPortal(
        <div className="drawer-overlay-backdrop" onClick={cerrarPanelApuesta}>
          <div className="drawer-lateral-premium-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header-top">
              <h3>🎯 Registrar Pronóstico</h3>
              <button className="boton-cerrar-drawer-x" onClick={cerrarPanelApuesta}>&times;</button>
            </div>
            <div className="drawer-body-info">
              <div className="caja-formulario-apuesta-drawer">
                
                {/* Modal Local */}
                <div className="bando-drawer-interactive local">
                  <div className="avatar-bandera-gigante">
                    <img src={partidoSeleccionado.bandera_local || '/src/assets/banderas/default.png'} alt={partidoSeleccionado.nombre_local} onError={(e) => { e.target.src = '⚽'; }} />
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

                {/* Modal Visitante */}
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
                    <img src={partidoSeleccionado.bandera_visitante || '/src/assets/banderas/default.png'} alt={partidoSeleccionado.nombre_visitante} onError={(e) => { e.target.src = '⚽'; }} />
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