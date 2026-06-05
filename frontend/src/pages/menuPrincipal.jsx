import React, { useState } from 'react';
import logoGolStadys from '../assets/logosinletras.png';
import './menuPrincipal.css'; // Integración de la nueva hoja de estilos

function MenuPrincipal() {
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  // Definición de las secciones sin emojis, usando metadatos limpios
  const modulosDashboard = [
    { id: 'campeonatos', titulo: 'Campeonatos', desc: 'Explorar ligas y torneos activos' },
    { id: 'pronosticos', titulo: 'Pronósticos', desc: 'Gestionar tus marcadores y apuestas' },
    { id: 'ranking', titulo: 'Ranking Global', desc: 'Tabla de posiciones en tiempo real' },
    { id: 'estadisticas', titulo: 'Mis Estadísticas', desc: 'Analizar tu rendimiento histórico' },
  ];

  return (
    <div className="contenedor-dashboard">
      
      {/* NAVBAR SUPERIOR COHESIVA */}
      <header className="navbar-superior">
        <div className="logo-contenedor">
          <img 
            src={logoGolStadys} 
            alt="GolStadys Premium" 
            className="logo-navbar"
            onClick={() => setSeccionActiva('inicio')} 
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="usuario-acciones">
          <button 
            onClick={() => alert('Sesión finalizada de forma segura.')} 
            className="boton-logout-premium"
          >
            Salir del Estadio
          </button>
        </div>
      </header>

      {/* ESPACIO DINÁMICO DE CONTENIDO */}
      <main className="espacio-contenido">
        
        {seccionActiva === 'inicio' ? (
          <>
            {/* Cabecera de bienvenida */}
            <div className="bienvenida-header">
              <h2>¡Bienvenido al Estadio, <span className="resaltado-neon">Crack</span>!</h2>
              <p>Selecciona un módulo a continuación para gestionar tus operaciones futbolísticas.</p>
            </div>

            {/* GRILLA DE SECCIONES (Sustituye al menú vertical colapsado) */}
            <div className="grilla-navegacion">
              {modulosDashboard.map((modulo) => (
                <div 
                  key={modulo.id}
                  className="tarjeta-menu-premium"
                  onClick={() => setSeccionActiva(modulo.id)}
                >
                  {/* Icono vectorial abstracto generado por CSS */}
                  <div className="icono-vectorial">
                    <div className="vector-dot"></div>
                  </div>
                  
                  <div className="info-meta">
                    <span className="titulo-meta">{modulo.titulo}</span>
                    <span className="subtitulo-meta">{modulo.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SECCIÓN LIVE FEED (KPIs Inferiores fijos del inicio) */}
            <div className="panel-inferior-resumen">
              <div className="card-live-feed">
                <div className="indicador-pulso"></div>
                <div className="info-meta">
                  <span className="titulo-meta" style={{ fontSize: '1rem' }}>Próxima Fecha</span>
                  <span className="subtitulo-meta" style={{ color: '#00ff88' }}>¡Cierre en menos de 2 horas!</span>
                </div>
              </div>
              
              <div className="card-live-feed">
                <div className="icono-vectorial" style={{ margin: 0, width: '30px', height: '30px' }}>🎯</div>
                <div className="info-meta">
                  <span className="titulo-meta" style={{ fontSize: '1rem' }}>Tu Posición</span>
                  <span className="subtitulo-meta">Puesto #14 en el Torneo Global</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* VISTA CONTENEDORA PARA LOS MÓDULOS DE TRABAJO */
          <div style={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button 
              className="boton-logout-premium" 
              style={{ width: 'fit-content', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', backgroundcolor: 'rgba(12, 1, 1, 0.43)' }}
              onClick={() => setSeccionActiva('inicio')}
            >
              ← Volver al Dashboard
            </button>
            
            <div className="bienvenida-header">
              <h2>
                Módulo: <span className="resaltado-neon">
                  {modulosDashboard.find(m => m.id === seccionActiva)?.titulo}
                </span>
              </h2>
            </div>

            <div className="vista-modulo-vacio">
              ⚙️ Entorno analítico en fase de desarrollo. Próxima vinculación de bases de datos.
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default MenuPrincipal;