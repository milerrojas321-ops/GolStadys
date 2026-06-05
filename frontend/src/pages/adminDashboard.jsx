import React, { useState } from 'react';
import logoGolStadys from '../assets/logo.png';
import './adminDashboard.css'; // Conexión con los estilos premium

function AdminDashboard({ alCerrarPanelAdmin }) {
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // Configuración de herramientas mapeadas para evitar redundancia de código
  const herramientasAdmin = [
    {
      id: 'fixture',
      titulo: 'Gestión de Fixture',
      descripcion: 'Programar partidos, emparejar equipos, definir horarios e interrumpir flujos de apuestas de forma manual.',
      modulo: 'CRONOGRAMA',
    },
    {
      id: 'var',
      titulo: 'Módulo del VAR Oficial',
      descripcion: 'Cargar marcadores reales de los partidos terminados y ejecutar el algoritmo de liquidación de puntos masiva.',
      modulo: 'LIQUIDACIÓN',
    },
    {
      id: 'usuarios',
      titulo: 'Control de Aprendices',
      descripcion: 'Monitorear la base de datos de jugadores, moderar perfiles inapropiados y gestionar permisos de acceso.',
      modulo: 'SEGURIDAD',
    },
    {
      id: 'auditoria',
      titulo: 'Auditoría del Sistema',
      descripcion: 'Analizar tendencias de apuestas por partido y verificar la velocidad de respuesta de las consultas SQL.',
      modulo: 'MÉTRICAS',
    },
  ];

  return (
    <div className="contenedor-admin">
      
      {/* NAVBAR DE COMANDO SUPERIOR */}
      <header className="navbar-admin">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src={logoGolStadys} alt="GolStadys" style={{ height: '40px' }} />
          <span className="badge-rol">System Admin</span>
        </div>
        <button 
          className="boton-logout-premium"
          onClick={vistaActiva === 'dashboard' ? alCerrarPanelAdmin : () => setVistaActiva('dashboard')}
        >
          {vistaActiva === 'dashboard' ? 'Salir del VAR' : '← Volver al Panel'}
        </button>
      </header>

      {/* CUERPO CENTRAL DE OPERACIONES */}
      <main className="espacio-admin">
        
        {vistaActiva === 'dashboard' ? (
          <>
            {/* 1. SECCIÓN DE MONITOREO DE EVENTOS (KPIs) */}
            <section className="fila-kpis">
              <div className="kpi-card">
                <div className="kpi-info">
                  <span className="kpi-titulo">Estado del Servidor</span>
                  <span className="kpi-valor" style={{ color: '#00ff88', fontSize: '1.4rem' }}>ONLINE</span>
                </div>
                <div className="pulso-var"></div>
              </div>

              <div className="kpi-card">
                <div className="kpi-info">
                  <span className="kpi-titulo">Total Jugadores</span>
                  <span className="kpi-valor">1,420</span>
                </div>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
              </div>

              <div className="kpi-card">
                <div className="kpi-info">
                  <span className="kpi-titulo">Apuestas en la Fecha</span>
                  <span className="kpi-valor">89%</span>
                </div>
                <span style={{ fontSize: '1.5rem' }}>⚽</span>
              </div>

              <div className="kpi-card">
                <div className="kpi-info">
                  <span className="kpi-titulo">Partidos por Liquidar</span>
                  <span className="kpi-valor" style={{ color: '#ef4444' }}>3</span>
                </div>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              </div>
            </section>

            {/* 2. CORE: GRILLA DE HERRAMIENTAS ADM */}
            <section className="grilla-herramientas">
              {herramientasAdmin.map((item) => (
                <div 
                  key={item.id}
                  className="tarjeta-control-premium"
                  onClick={() => setVistaActiva(item.id)}
                >
                  <div className="cabecera-tarjeta-adm">
                    <div className="vector-linea-status"></div>
                    <span className="badge-modulo">{item.modulo}</span>
                  </div>

                  <div className="cuerpo-tarjeta-adm">
                    <h3>{item.titulo}</h3>
                    <p>{item.descripcion}</p>
                  </div>

                  <div className="footer-tarjeta-adm">
                    <span style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: 600 }}>GESTIONAR</span>
                    <span className="flecha-interactiva">→</span>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          /* 3. CONTENEDOR INTERNO CUANDO SE SELECCIONA UN MÓDULO */
          <section className="contenedor-vista-modulo">
            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '10px' }}>
              Consola // <span style={{ color: '#00ff88' }}>
                {herramientasAdmin.find(h => h.id === vistaActiva)?.titulo}
              </span>
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }}>
              Entorno administrativo seguro. Los cambios realizados afectarán las tablas relacionales de la base de datos en tiempo real.
            </p>

            {/* Renderizado específico por ID para construir los futuros formularios */}
            {vistaActiva === 'var' && (
              <div style={{ color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                ⚽ [Espacio asignado para la lista de partidos de la fecha actual y inputs de marcadores].
              </div>
            )}

            {vistaActiva === 'fixture' && (
              <div style={{ color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                📅 [Espacio asignado para los controladores de creación de ligas y bloqueo de horarios].
              </div>
            )}

            {/* Fallback de desarrollo para los módulos restantes */}
            {['usuarios', 'auditoria'].includes(vistaActiva) && (
              <div style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>
                ⚙️ Módulo de control en fase de desarrollo analítico (ADSO).
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;