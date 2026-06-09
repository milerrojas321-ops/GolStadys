import React, { useState } from 'react';
import { createPortal } from 'react-dom'; 
import './calendario_apuestas.css';

function CalendarioApuestas() {
  const [jornadaActiva, setJornadaActiva] = useState(1);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [predicciones, setPredicciones] = useState({});

  // Recuperamos tu estado de Base de Datos exacta para que no salga "not defined"
  const [partidosPorFecha, setPartidosPorFecha] = useState({
    1: [
      {
        id: 'partido_01',
        equipoLocal: 'Colombia',
        equipoVisitante: 'Portugal',
        banderaLocal: '/src/assets/banderas/colombia.png',
        banderaVisitante: '/src/assets/banderas/portugal.png',
        fecha: 'Martes, 16 de Junio',
        hora: '18:00',
        estadio: 'Metropolitano Roberto Meléndez',
        pronosticado: false,
        golesLocalPred: '',
        golesVisitantePred: ''
      },
      {
        id: 'partido_02',
        equipoLocal: 'Argentina',
        equipoVisitante: 'Francia',
        banderaLocal: '/src/assets/banderas/argentina.png',
        banderaVisitante: '/src/assets/banderas/francia.png',
        fecha: 'Miércoles, 17 de Junio',
        hora: '20:00',
        estadio: 'Estadio Lusail',
        pronosticado: true,
        golesLocalPred: '2',
        golesVisitantePred: '1'
      }
    ],
    2: [],
    3: []
  });

  const abrirPanelApuesta = (partido) => {
    const localActual = predicciones[partido.id]?.local ?? partido.golesLocalPred;
    const visitanteActual = predicciones[partido.id]?.visitante ?? partido.golesVisitantePred;
    
    setPredicciones(prev => ({
      ...prev,
      [partido.id]: { local: localActual, visitante: visitanteActual }
    }));
    setPartidoSeleccionado(partido);
  };

  const cerrarPanelApuesta = () => setPartidoSeleccionado(null);

  const handleInputChange = (partidoId, bando, valor) => {
    if (valor !== '' && !/^\d+$/.test(valor)) return;
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [bando]: valor }
    }));
  };

  const guardarCambiosApuesta = (partido) => {
    // Aquí puedes añadir tu lógica para actualizar el estado o enviar a Laravel/Node
    cerrarPanelApuesta();
  };

  // Leemos del estado de forma segura
  const partidosActuales = partidosPorFecha[jornadaActiva] || [];

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

      {/* LISTADO ÚNICO DE PARTIDOS */}
      <div className="lista-encuentros-fixture-scroll">
        {partidosActuales.length > 0 ? (
          partidosActuales.map((partido) => (
            <div key={partido.id} className={`tarjeta-partido-fixture ${partido.pronosticado ? 'tarjeta-completada' : ''}`}>
              <div className="partido-meta-top">
                <span className="badge-fecha-hora">📅 {partido.fecha} — ⏰ {partido.hora}</span>
                <span className="badge-estadio">🏟️ {partido.estadio}</span>
              </div>

              <div className="bloque-enfrentamiento-marcador">
                <div className="bando-equipo-compacto local">
                  <span className="nombre-pais-estadio">{partido.equipoLocal}</span>
                  <div className="contenedor-bandera-compacta">
                    <img src={partido.banderaLocal} alt={partido.equipoLocal} className="imagen-bandera-redonda" onError={(e) => { e.target.src = '⚽'; }} />
                  </div>
                </div>

                <div className="zona-marcador-preview">
                  <span className="marcador-num">{partido.pronosticado ? partido.golesLocalPred : '-'}</span>
                  <div className="separador-vs-compacto">VS</div>
                  <span className="marcador-num">{partido.pronosticado ? partido.golesVisitantePred : '-'}</span>
                </div>

                <div className="bando-equipo-compacto visitante">
                  <div className="contenedor-bandera-compacta">
                    <img src={partido.banderaVisitante} alt={partido.equipoVisitante} className="imagen-bandera-redonda" onError={(e) => { e.target.src = '⚽'; }} />
                  </div>
                  <span className="nombre-pais-estadio">{partido.equipoVisitante}</span>
                </div>
              </div>

              <div className="partido-acciones-footer">
                <button className="boton-registrar-apuesta-neon" onClick={() => abrirPanelApuesta(partido)}>
                  {partido.pronosticado ? '🔄 Editar Pronóstico' : 'Apostar!!!'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="vista-modulo-vacio-calendario" style={{ marginTop: '20px', color: '#718096' }}>
            ⚙️ No hay partidos disponibles para esta fecha.
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
                <div className="bando-drawer-interactive local">
                  <div className="avatar-bandera-gigante">
                    <img src={partidoSeleccionado.banderaLocal} alt={partidoSeleccionado.equipoLocal} onError={(e) => { e.target.src = '⚽'; }} />
                  </div>
                  <span className="nombre-pais-drawer">{partidoSeleccionado.equipoLocal}</span>
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="-"
                    value={predicciones[partidoSeleccionado.id]?.local ?? ''}
                    onChange={(e) => handleInputChange(partidoSeleccionado.id, 'local', e.target.value)}
                    className="input-goles-drawer-neon"
                  />
                </div>
                <div className="vs-intermedio-drawer">VS</div>
                <div className="bando-drawer-interactive visitante">
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="-"
                    value={predicciones[partidoSeleccionado.id]?.visitante ?? ''}
                    onChange={(e) => handleInputChange(partidoSeleccionado.id, 'visitante', e.target.value)}
                    className="input-goles-drawer-neon"
                  />
                  <span className="nombre-pais-drawer">{partidoSeleccionado.equipoVisitante}</span>
                  <div className="avatar-bandera-gigante">
                    <img src={partidoSeleccionado.banderaVisitante} alt={partidoSeleccionado.equipoVisitante} onError={(e) => { e.target.src = '⚽'; }} />
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