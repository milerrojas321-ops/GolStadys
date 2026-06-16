// src/pages/ranking.jsx
import React, { useEffect, useState } from 'react';
import './ranking.css';

function Ranking() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Llamada al endpoint de GolStadys
    fetch('https://golstadys-production.up.railway.app/api/ranking')
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar el ranking:', err);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div className="ranking-loading">
        <div className="spinner-golstadys"></div>
        <p>Procesando analítica del ranking...</p>
      </div>
    );
  }

  const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];

  // Separar los 3 primeros para el podio y el resto para la tabla baja
  const top3 = listaUsuarios.slice(0, 3);
  const elResto = listaUsuarios.slice(3);

  // Ordenar visualmente el podio: [Plata (#2), Oro (#1), Bronce (#3)]
  const podioOrdenado = [];
  if (top3[1]) podioOrdenado.push({ ...top3[1], posicionReal: 2, estilo: 'plata' }); // #2
  if (top3[0]) podioOrdenado.push({ ...top3[0], posicionReal: 1, estilo: 'oro' });   // #1
  if (top3[2]) podioOrdenado.push({ ...top3[2], posicionReal: 3, estilo: 'bronce' }); // #3

  return (
    <div className="ranking-contenedor">
      <div className="ranking-encabezado">
        <h1 className="ranking-titulo">
          Tabla de <span className="text-neon">Posiciones</span>
        </h1>
        <p className="ranking-subtitulo">Módulo analítico en tiempo real de GolStadys</p>
      </div>

      {/* 🏆 CONTENEDOR DEL PODIO PREMIUM */}
      {top3.length > 0 && (
        <div className="podio-contenedor">
          {podioOrdenado.map((user) => (
            <div 
              key={user.id_usuario} 
              className={`tarjeta-podio ${user.estilo}`}
            >
              <div className="corona-posicion">
                {user.posicionReal === 1 ? '👑' : user.posicionReal === 2 ? '🥈' : '🥉'}
              </div>
              <div className="avatar-podio">👤</div>
              {/* 🟢 CORREGIDO: Usamos nombre_completo */}
              <div className="nombre-podio">{user.nombre_completo || 'Usuario'}</div>
              {/* 🟢 CORREGIDO: Usamos puntaje_total */}
              <div className="puntos-podio">{user.puntaje_total || 0} pts</div>
              <div className="rango-badge">Top #{user.posicionReal}</div>
              <div className="brillo-reflejo"></div>
            </div>
          ))}
        </div>
      )}

      {/* 📊 TABLA DEL RESTO DE PARTICIPANTES */}
      <div className="tabla-ranking-contenedor">
        <table className="tabla-ranking-premium">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Participante</th>
              <th className="text-centro">Puntos Totales</th>
            </tr>
          </thead>
          <tbody>
            {elResto.map((user, index) => (
              <tr 
                key={user.id_usuario} 
                className="fila-ranking" 
                style={{ '--anim-index': index }}
              >
                <td className="col-posicion">#{index + 4}</td>
                <td className="col-usuario">
                  <div className="usuario-info-celda">
                    <span className="mini-avatar">🎮</span>
                    {/* 🟢 CORREGIDO: Usamos nombre_completo */}
                    {user.nombre_completo || 'Jugador Anónimo'}
                  </div>
                </td>
                {/* 🟢 CORREGIDO: Usamos puntaje_total */}
                <td className="col-puntos text-centro">{user.puntaje_total || 0} pts</td>
              </tr>
            ))}
            {listaUsuarios.length === 0 && (
              <tr>
                <td colSpan="3" className="tabla-vacia">No hay registros de usuarios aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ranking;