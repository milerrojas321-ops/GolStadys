// src/pages/menuPrincipal.jsx
import React, { useState } from 'react';
import logoGolStadys from '../assets/logosinletras.png';
import './menuPrincipal.css';
import Campeonatos from './campeonatos';
import Ranking from './ranking';
import Pronosticos from './pronosticos';

// Importación de Iconos Vectoriales PRO (Reemplazo total de emojis)
import { 
  Home, 
  Trophy, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  LogOut, 
  User, 
  ChevronRight, 
  Calendar, 
  Target 
} from 'lucide-react';

function MenuPrincipal({ alCerrarSesion, usuarioGlobal }) { 
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  const modulosDashboard = [
    { id: 'campeonatos', titulo: 'Campeonatos', desc: 'Explorar ligas y torneos activos', icono: Trophy },
    { id: 'pronosticos', titulo: 'Pronósticos', desc: 'Gestionar marcadores y predicciones', icono: Sparkles },
    { id: 'ranking', titulo: 'Ranking Global', desc: 'Tabla de posiciones en tiempo real', icono: BarChart3 },
    { id: 'estadisticas', titulo: 'Mis Estadísticas', desc: 'Analizar rendimiento histórico', icono: TrendingUp }
  ];

  return (
    <div className="contenedor-dashboard">
      
      {/* NAVBAR SUPERIOR CONTEMPORÁNEO */}
      <header className="navbar-superior">
        <div className="logo-contenedor" onClick={() => setSeccionActiva('inicio')}>
          <img 
            src={logoGolStadys} 
            alt="GolStadys Premium" 
            className="logo-navbar"
          />
          <span className="logo-texto-premium">GOLSTADYS <small>PRO</small></span>
        </div>

        {/* ESPACIO EXCLUSIVO AJUSTADO PARA EL PERFIL */}
        <div className="perfil-navbar-derecho">
          <div className="avatar-contenedor-pro">
            <User className="icono-avatar-vectorial" size={18} />
          </div>
          <div className="info-usuario-logged">
            <span className="nombre-user">{usuarioGlobal?.nombre || "Usuario Invitado"}</span>
            <span className="rol-user-badge">{usuarioGlobal?.rol || "Especialista"}</span>
          </div>
          
          <div className="divisor-vertical-navbar"></div>

          <button 
            className="boton-cerrar-sesion-navbar" 
            onClick={alCerrarSesion} 
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <main className="area-principal-dashboard">
        
        {/* SIDEBAR ERGONÓMICO */}
        <aside className="sidebar-navegacion">
          <nav className="menu-enlaces-grupo">
            <button 
              className={`enlace-sidebar ${seccionActiva === 'inicio' ? 'activo' : ''}`}
              onClick={() => setSeccionActiva('inicio')}
            >
              <Home size={18} className="icono-sidebar-pro" />
              <span>Inicio</span>
            </button>
            
            {modulosDashboard.map((mod) => {
              const IconoModulo = mod.icono;
              return (
                <button
                  key={mod.id}
                  className={`enlace-sidebar ${seccionActiva === mod.id ? 'activo' : ''}`}
                  onClick={() => setSeccionActiva(mod.id)}
                >
                  <IconoModulo size={18} className="icono-sidebar-pro" />
                  <span>{mod.titulo}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ÁREA DE CONTENIDO CON ANIMACIÓN DE ENTRADA */}
        <section className="zona-render-dinamico">
          {seccionActiva === 'inicio' ? (
            <div className="vista-inicio-animada">
              
              {/* BANNER LIMPIO DE BIENVENIDA */}
              <div className="bienvenida-banner">
                <div className="bloque-titulado">
                  <h1>Panel de Control, {usuarioGlobal?.nombre || 'Analista'}</h1>
                  <p>Monitorea métricas en tiempo real, optimiza tus predicciones analíticas antes de cada partido y compite en el escalafón general.</p>
                </div>
              </div>

              {/* GRID PREMIUM CON TRANSICIONES DINÁMICAS */}
              <div className="grid-accesos-rapidos">
                {modulosDashboard.map((modulo) => {
                  const IconoTarjeta = modulo.icono;
                  return (
                    <div 
                      className="tarjeta-acceso-rapido-premium" 
                      key={modulo.id}
                      onClick={() => setSeccionActiva(modulo.id)}
                    >
                      <div className="encabezado-tarjeta-acceso">
                        <div className="contenedor-icono-tarjeta">
                          <IconoTarjeta size={20} className="icono-interno-card" />
                        </div>
                        <ChevronRight className="flecha-indicador" size={16} />
                      </div>
                      <h3>{modulo.titulo}</h3>
                      <p>{modulo.desc}</p>
                      <div className="linea-brillo-efecto"></div>
                    </div>
                  );
                })}
              </div>

              {/* FEED METADATOS DE SEGUIMIENTO */}
              <div className="seccion-metadatos-vivo">
                <div className="card-live-feed">
                  <div className="icono-vectorial-wrapper-feed">
                    <Calendar size={18} />
                  </div>
                  <div className="info-meta">
                    <span className="titulo-meta">Próxima Fecha</span>
                    <span className="subtitulo-meta highlight-feed">Cierre en menos de 2 horas</span>
                  </div>
                </div>
                
                <div className="card-live-feed">
                  <div className="icono-vectorial-wrapper-feed">
                    <Target size={18} />
                  </div>
                  <div className="info-meta">
                    <span className="titulo-meta">Estado Analítico</span>
                    <span className="subtitulo-meta">Clasificación General Activa</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="contenedor-vista-modulo-activa">
              {seccionActiva === 'campeonatos' && <Campeonatos />}
              {seccionActiva === 'ranking' && <Ranking />}
              {seccionActiva === 'pronosticos' && <Pronosticos usuarioGlobal={usuarioGlobal} />}
              {seccionActiva === 'estadisticas' && (
                <div className="estadisticas-placeholder">
                  <h2>Módulo en desarrollo analítico</h2>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MenuPrincipal;