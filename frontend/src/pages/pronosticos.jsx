import React, { useEffect, useState } from 'react';
import './pronosticos.css';

// 🟢 RECIBE EL USUARIO GLOBAL DIRECTO DEL COMPONENTE PADRE
function Pronosticos({ usuarioGlobal }) {
  const [misPronosticos, setMisPronosticos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Extraemos el ID del estado global vivo. Si no existe, buscamos en el localStorage como plan de respaldo
  const id_usuario = usuarioGlobal?.id_usuario || JSON.parse(localStorage.getItem('usuario'))?.id_usuario || null;

  useEffect(() => {
    // Si la sesión aún se está procesando en el login, detenemos la consulta de forma segura
    if (!id_usuario || id_usuario === 'undefined') {
      console.warn("⚠️ Esperando por un id_usuario válido...");
      setCargando(false);
      return;
    }

    setCargando(true); 

    fetch(`http://localhost:5000/api/apuestas/usuario/${id_usuario}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(`➡️ Datos de apuestas recibidos para el id_usuario (${id_usuario}):`, data);
        
        if (Array.isArray(data)) {
          setMisPronosticos(data);
        } else {
          setMisPronosticos([]);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al recuperar pronósticos:', err);
        setMisPronosticos([]);
        setCargando(false);
      });
  }, [id_usuario]); // Vuelve a consultar inmediatamente si el usuario cambia

  if (!id_usuario) {
    return (
      <div className="pronosticos-vacio">
        <div className="icono-vacio">🔑</div>
        <h3>Por favor, inicia sesión para gestionar tus pronósticos.</h3>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="pronosticos-loading">
        <div className="spinner-golstadys"></div>
        <p>Cargando tus predicciones analíticas...</p>
      </div>
    );
  }

  return (
    <div className="pronosticos-contenedor animate-fade-in">
      {/* Encabezado del Módulo */}
      <div className="pronosticos-header">
        <div className="decoracion-linea"></div>
        <h2>Mis Pronósticos Registrados</h2>
        <p className="subtitulo-modulo">
          Historial completo de marcadores fijados para el torneo actual.
        </p>
      </div>

      {/* Grilla de Tarjetas Premium */}
      <div className="pronosticos-grid">
        {misPronosticos.map((apuesta, index) => (
          <div className="tarjeta-apuesta-premium" key={apuesta.id_partido || index}>
            {/* Encabezado Interno de la Tarjeta */}
            <div className="tarjeta-apuesta-header">
              <span className="badge-torneo">🏆 Conmebol</span>
              <span className="badge-estado pendiente">⏳ Pendiente</span>
            </div>

            {/* Bloque de Enfrentamiento Relacional */}
            <div className="bloque-enfrentamiento">
              {/* Bloque Equipo Local */}
              <div className="equipo-bloque">
                <span className="bandera-emoji">🏳️</span>
                <span className="nombre-equipo">{apuesta.equipo_local || 'Local'}</span> 
              </div>

              {/* Visualizador de Marcador Pronosticado */}
              <div className="marcador-fijado-display">
                <span className="goles-display">{apuesta.prediccion_goles_local}</span>
                <span className="vs-line">-</span>
                <span className="goles-display">{apuesta.prediccion_goles_visitante}</span>
              </div>

              {/* Bloque Equipo Visitante */}
              <div className="equipo-bloque">
                <span className="bandera-emoji">🏳️</span>
                <span className="nombre-equipo">{apuesta.equipo_visitante || 'Visitante'}</span>
              </div>
            </div>

            {/* Pie de la tarjeta con efecto reflejo */}
            <div className="tarjeta-apuesta-footer">
              <p className="texto-info-id">Partido ID: #{apuesta.id_partido}</p>
            </div>
            <div className="brillo-reflejo-apuesta"></div>
          </div>
        ))}
      </div>

      {/* Vista de Control cuando el arreglo está vacío */}
      {misPronosticos.length === 0 && (
        <div className="pronosticos-vacio">
          <div className="icono-vacio">⚽</div>
          <h3>Aún no has fijado ningún marcador</h3>
          <p>Explora los campeonatos activos para empezar a registrar tus predicciones de juego.</p>
        </div>
      )}
    </div>
  );
}

export default Pronosticos;