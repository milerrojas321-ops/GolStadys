import React, { useState } from 'react';
import logoGolStadys from '../assets/logosinletras.png';
import './menuPrincipal.css';
import Campeonatos from './campeonatos';

function MenuPrincipal() {
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  const modulosDashboard = [
    { id: 'campeonatos', titulo: 'Campeonatos', desc: 'Explorar ligas y torneos activos' },
    { id: 'pronosticos', titulo: 'Pronósticos', desc: 'Gestionar tus marcadores y apuestas' },
    { id: 'ranking', titulo: 'Ranking Global', desc: 'Tabla de posiciones en tiempo real' },
    { id: 'estadisticas', titulo: 'Mis Estadísticas', desc: 'Analizar tu rendimiento histórico' },
  ];

  return (
    <div className="contenedor-dashboard">
      
      {/* NAVBAR SUPERIOR */}
      <header className="navbar-superior">
        
        {/* LADO IZQUIERDO: SOLO EL LOGO */}
        <div className="logo-contenedor">
          <img 
            src={logoGolStadys} 
            alt="GolStadys Premium" 
            className="logo-navbar"
            onClick={() => setSeccionActiva('inicio')} 
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* CENTRO: TÍTULO DINÁMICO */}
        <div className="seccion-actual-navbar">
          {seccionActiva !== 'inicio' && (
            <h2 className="titulo-modulo-nav">
              Módulo: <span className="resaltado-neon-nav">{modulosDashboard.find(m => m.id === seccionActiva)?.titulo}</span>
            </h2>
          )}
        </div>

        {/* LADO DERECHO: TODO EL GRUPO DE ACCIONES JUNTO */}
        <div className="usuario-acciones">
          
          {/* 🏠 LA CASITA: Ahora empaquetada estrictamente a la derecha con los demás iconos */}
          {seccionActiva !== 'inicio' && (
            <button 
              className="boton-home-nav"
              onClick={() => setSeccionActiva('inicio')}
              title="Volver al Menú Principal"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="icono-casita"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          )}

          {/* Botón icónico de salir */}
          <button 
            className="boton-logout-icono"
            onClick={() => {
              if(window.confirm('¿Seguro que deseas salir del Estadio GolStadys?')) {
                alert('Sesión finalizada de forma segura.');
              }
            }}
            title="Cerrar Sesión"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="icono-logout"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* CONTENEDOR DE CONTENIDO */}
      <main className="espacio-contenido">
        {seccionActiva === 'inicio' ? (
          <>
            <div className="bienvenida-header">
              <h2>¡Bienvenido al Estadio, <span className="resaltado-neon">Crack</span>!</h2>
            </div>

            <div className="grilla-navegacion">
              {modulosDashboard.map((modulo) => (
                <div 
                  key={modulo.id}
                  className="tarjeta-menu-premium"
                  onClick={() => setSeccionActiva(modulo.id)}
                >
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <div className="contenedor-vista-modulo-activa">
              {seccionActiva === 'campeonatos' && <Campeonatos />}
              {seccionActiva !== 'campeonatos' && (
                <div className="vista-modulo-vacio">
                  ⚙️ Entorno analítico en fase de desarrollo. Próxima vinculación de bases de datos.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default MenuPrincipal;