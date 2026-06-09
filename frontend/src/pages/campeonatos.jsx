import React, { useState } from 'react';
import './campeonatos.css'; 
import CalendarioApuestas from './calendario_apuestas'; 

function Campeonatos() {
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);

  const torneos = [
    { id: 'mundial2026', nombre: 'Mundial 2026', categoria: 'internacional', estado: 'Disponible', partidosActivos: 24, premioPool: '500K Pts', popularidad: '🔥 ALTA', logo: '🏆' },
    { id: 'champions26', nombre: 'UEFA Champions League', categoria: 'internacional', estado: 'Disponible', partidosActivos: 16, premioPool: '350K Pts', popularidad: '⭐ Destacado', logo: '⚽' },
    { id: 'liga_col', nombre: 'Liga BetPlay DIMAYOR', categoria: 'locales', estado: 'Próximamente', partidosActivos: 0, premioPool: '200K Pts', popularidad: '🇨🇴 Local', logo: '🥇' },
    { id: 'premier_league', nombre: 'Premier League', categoria: 'europeas', estado: 'Disponible', partidosActivos: 10, premioPool: '300K Pts', popularidad: '⚡ Top', logo: '🦁' }
  ];

  const torneosFiltrados = filtroActivo === 'todos' 
    ? torneos 
    : torneos.filter(t => t.categoria === filtroActivo);

  // Si hay un torneo seleccionado, renderizamos de forma limpia la vista del calendario
  if (torneoSeleccionado) {
    return (
      <div className="submodulo-calendario-wrapper">
        <button 
          className="boton-regresar-modulo" 
          onClick={() => setTorneoSeleccionado(null)}
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

      {/* GRILLA REDISEÑADA: TARJETAS MÁS PEQUEÑAS Y VISUALMENTE LIMPIAS */}
      <div className="grilla-torneos-compacta">
        {torneosFiltrados.map((torneo) => (
          <div key={torneo.id} className="tarjeta-torneo-mini">
            
            {/* Encabezado reducido */}
            <div className="mini-torneo-header">
              <span className="mini-logo">{torneo.logo}</span>
              <div className="mini-titulos">
                <h3>{torneo.nombre}</h3>
                <span className={`mini-badge-estado ${torneo.estado.toLowerCase()}`}>
                  {torneo.estado}
                </span>
              </div>
            </div>

            {/* Estadísticas ordenadas en una sola línea */}
            <div className="mini-torneo-stats">
              <div className="mini-stat">
                <span className="mini-label">Partidos</span>
                <span className="mini-valor neon">{torneo.partidosActivos}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-label">Pool</span>
                <span className="mini-valor platino">{torneo.premioPool}</span>
              </div>
            </div>

            {/* Botón de acción integrado perfectamente */}
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