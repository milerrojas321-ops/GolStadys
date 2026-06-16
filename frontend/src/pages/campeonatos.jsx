import React, { useState, useEffect } from 'react';
import './campeonatos.css'; 
import CalendarioApuestas from './calendario_apuestas'; 

function Campeonatos() {
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  
  // 1. Estados nuevos para controlar los datos de la base de datos y la carga
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 2. Efecto para traer de forma asíncrona los torneos desde el Backend
  useEffect(() => {
    const cargarTorneosDesdeBD = async () => {
      try {
        const respuesta = await fetch('https://golstadys-production.up.railway.app/api/torneos');
        const datos = await respuesta.json();
        setTorneos(datos);
        setCargando(false);
      } catch (error) {
        console.error('❌ Error al conectar con el backend:', error);
        setCargando(false);
      }
    };

    cargarTorneosDesdeBD();
  }, []);

  // 3. Sistema de filtros adaptado a los datos de la base de datos
  const torneosFiltrados = filtroActivo === 'todos' 
    ? torneos 
    : torneos.filter(t => t.categoria === filtroActivo);

  // Si está cargando los datos, muestra un aviso limpio respetando tu diseño
  if (cargando) {
    return (
      <div className="modulo-campeonatos-dinamico" style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>
        <p>Cargando campeonatos desde GolStadys...</p>
      </div>
    );
  }

  // Si hay un torneo seleccionado, renderizamos de forma limpia la vista del calendario
  if (torneoSeleccionado) {
    return (
      <div className="submodulo-calendario-wrapper">
        <button 
          className="boton-regresar-modulo" 
          onClick={() => setTorneoSeleccionado(torneo.id)}
        >
          ← Volver a Seleccionar Torneo
        </button>
        <CalendarioApuestas torneoId={torneoSeleccionado} />
      </div>
    );
  }

  return (
    <div className="modulo-campeonatos-dinamico">
      
      {/* SECCIÓN DE FILTROS COMPACTOS */}
      <div className="filtros-campeonatos-nav">
        {['todos', 'internacional', 'locales', 'europeas'].map((cat) => (
          <button 
            key={cat}
            className={`btn-filtro-premium ${filtroActivo === cat ? 'activo' : ''}`} 
            onClick={() => setFiltroActivo(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* GRILLA REDISEÑADA: TARJETAS CONECTADAS DIRECTAMENTE A MYSQL */}
      <div className="grilla-torneos-compacta">
        {torneosFiltrados.map((torneo) => (
          <div key={torneo.id_torneo} className="tarjeta-torneo-mini">
            
            {/* Encabezado dinámico mapeado con tu phpMyAdmin */}
            <div className="mini-torneo-header">
              <span className="mini-logo">{torneo.logo || '🏆'}</span>
              <div className="mini-titulos">
                <h3>{torneo.nombre}</h3>
                <span className={`mini-badge-estado ${torneo.estado ? torneo.estado.toLowerCase() === 'disponible' : ''}`}>
                  {torneo.estado}
                </span>
              </div>
            </div>

            {/* Estadísticas vinculadas a los nombres reales de tus columnas */}
            <div className="mini-torneo-stats">
              <div className="mini-stat">
                <span className="mini-label">Popularidad</span>
                <span className="mini-valor neon" style={{ fontSize: '0.85rem' }}>
                  {torneo.popularidad || 'MEDIA'}
                </span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Pool</span>
                <span className="mini-valor platino">{torneo.premio_pool}</span>
              </div>
            </div>

            {/* Botón de acción interactivo */}
            <div className="mini-torneo-footer">
              {torneo.estado === 'Disponible' ? (
                <button 
                  className="boton-mini-fixture" 
                  onClick={() => setTorneoSeleccionado(torneo.id)}
                >
                  Ver Calendario
                </button>
              ) : (
                <button className="boton-mini-fixture deshabilitado" disabled>
                  Bloqueado
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Campeonatos;