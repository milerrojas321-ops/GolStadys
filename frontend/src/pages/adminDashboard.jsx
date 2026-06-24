// src/pages/adminDashboard.jsx
import React, { useState, useEffect } from 'react';
import logoGolStadys from '../assets/logosinletras.png';
import './adminDashboard.css';
import { 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function AdminDashboard({ alCerrarSesion, usuarioGlobal }) {
  const [partidos, setPartidos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [selecciones, setSelecciones] = useState([]); // Espacio listo para los equipos reales
  const [cargando, setCargando] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });

  // Estados para el formulario de nuevo partido
  const [nuevoPartido, setNuevoPartido] = useState({
    id_torneo: '',
    id_local: '',
    id_visitante: '',
    fecha_hora: '', 
    estado: 'programado'
  });

  const [marcadoresEnTabla, setMarcadoresEnTabla] = useState({});

  useEffect(() => {
    fetchPartidos();
    fetchTorneos();
    // Aquí llamaremos a fetchSelecciones() apenas habilitemos el endpoint en tu backend
  }, []);

  const mostrarFeedback = (texto, tipo) => {
    setMensajeFeedback({ texto, tipo });
    setTimeout(() => setMensajeFeedback({ texto: '', tipo: '' }), 4000);
  };

  const fetchTorneos = () => {
    fetch('https://golstadys-production.up.railway.app/api/torneos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTorneos(data);
      })
      .catch((err) => console.error('Error al traer torneos:', err));
  };

  const fetchPartidos = () => {
    setCargando(true);
    fetch('https://golstadys-production.up.railway.app/api/partidos')
      .then((res) => {
        if (!res.ok) throw new Error('Error en respuesta de red');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPartidos(data);
          const marcadoresIniciales = {};
          data.forEach(p => {
            marcadoresIniciales[p.id_partido] = {
              goles_local: p.goles_local_real ?? '',
              goles_visitante: p.goles_visitante_real ?? ''
            };
          });
          setMarcadoresEnTabla(marcadoresIniciales);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al traer partidos:', err);
        mostrarFeedback('No se pudo conectar con el servidor', 'error');
        setCargando(false);
      });
  };

  const manejarCrearPartido = async () => {
    //Capturamos los datos asegurando que id_torneo no llegue vacío ni en String
    const datosParaBackend = {
      id_torneo: parseInt(nuevoPartido.id_torneo, 10),
      id_local: parseInt(nuevoPartido.id_local, 10),
      id_visitante: parseInt(nuevoPartido.id_visitante, 10),
      fecha_hora: nuevoPartido.fecha_hora
    };

    // Validación básica antes de enviar
    if (!datosParaBackend.id_torneo || !datosParaBackend.id_local || !datosParaBackend.id_visitante || !datosParaBackend.fecha_hora) {
      mostrarFeedback('Por favor, completa todos los campos para crear el partido.', 'error');
      return;
    }

    try {
      setCargando(true);
      const respuesta = await fetch('https://golstadys-production.up.railway.app/api/partidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaBackend), // Envíos limpios al backend
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        mostrarFeedback('¡Partido programado y registrado con éxito!', 'exito');
        // Limpiamos el formulario
        setNuevoPartido({
          id_torneo: '',
          id_local: '',
          id_visitante: '',
          fecha_hora: '',
          estado: 'programado',
        });
        // Recargamos la lista de partidos en tiempo real
        fetchPartidos();
      } else {
        mostrarFeedback(datos.mensaje || 'Error al guardar el partido.', 'error');
      }
    } catch (error) {
      console.error('Error de red en manejarCrearPartido:', error);
      mostrarFeedback('Error de conexión con el servidor de GolStadys.', 'error');
    } finally {
      setCargando(false);
    }
  };

const manejarGuardarResultadoDirecto = async (idPartido) => {
    const marcador = marcadoresEnTabla[idPartido];
    if (!marcador || marcador.goles_local === '' || marcador.goles_visitante === '') {
      mostrarFeedback('Por favor, ingresa los goles de ambos equipos antes de guardar.', 'error');
      return;
    }

    try {
      //RUTA CORREGIDA: Cambiada para que coincida con router.post('/partidos/:id_partido/resultado')
      const urlCorrecta = `https://golstadys-production.up.railway.app/api/partidos/${idPartido}/resultado`;

      const respuesta = await fetch(urlCorrecta, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goles_local: parseInt(marcador.goles_local, 10),
          goles_visitante: parseInt(marcador.goles_visitante, 10),
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        mostrarFeedback('¡Marcador oficial asentado y puntos distribuidos!', 'exito');
        fetchPartidos(); // Refrescar la tabla
      } else {
        mostrarFeedback(datos.mensaje || 'No se pudo registrar el marcador.', 'error');
      }
    } catch (error) {
      console.error('❌ Error en el frontend al enviar marcador:', error);
      mostrarFeedback('Error de red al conectar con el servidor.', 'error');
    }
  };

  const manejarCambioInputMarcador = (idPartido, campo, valor) => {
    setMarcadoresEnTabla({
      ...marcadoresEnTabla,
      [idPartido]: {
        ...marcadoresEnTabla[idPartido],
        [campo]: valor
      }
    });
  };

  return (
    <div className="contenedor-admin-dashboard">
      <header className="navbar-superior-admin">
        <div className="logo-contenedor-admin">
          <img src={logoGolStadys} alt="GolStadys" className="logo-navbar" style={{ height: '40px' }} />
          <span className="logo-texto-admin">GOLSTADYS <small className="badge-admin-tag">COMMAND CENTER</small></span>
        </div>
        <div className="perfil-navbar-derecho" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="info-usuario-logged" style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#e2e8f0' }}>Admin Principal</div>
            <div style={{ fontSize: '0.7rem', color: '#00ff88' }}>SISTEMA OPERATIVO ACTIVO</div>
          </div>
          <button type="button" className="boton-cerrar-sesion-navbar" onClick={() => alCerrarSesion()}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {mensajeFeedback.texto && (
        <div className={`banner-feedback-admin ${mensajeFeedback.tipo}`}>
          {mensajeFeedback.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{mensajeFeedback.texto}</span>
        </div>
      )}

      <div className="area-principal-admin">
        <aside className="sidebar-admin">
          <button className="enlace-sidebar activo">
            <LayoutDashboard size={20} /> <span>Panel Único</span>
          </button>
        </aside>

        <section className="zona-render-admin">
          <div className="grid-gestion-partidos">
            
            {/* FORMULARIO DE INYECCIÓN CON SELECTS DINÁMICOS */}
            <div className="columna-formulario">
              <form onSubmit={manejarCrearPartido} className="formulario-admin-card">
                <h3><PlusCircle size={16} style={{ marginRight: '10px' }} /> Registrar Encuentro</h3>
                
                <div className="campo-admin">
                  <label>Campeonato / Torneo</label>
                  <select 
                    value={nuevoPartido.id_torneo} 
                    onChange={(e) => setNuevoPartido({ ...nuevoPartido, id_torneo: e.target.value })} 
                    required
                    className="select-admin-input"
                  >
                    <option value="">Selecciona un torneo...</option>
                    {torneos.map(t => (
                      <option key={t.id_torneo} value={t.id_torneo}>{t.nombre_torneo || `Torneo #${t.id_torneo}`}</option>
                    ))}
                  </select>
                </div>

                <div className="campo-admin-row">
                  <div className="campo-admin">
                    <label>ID Local (Muestra)</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 5" 
                      value={nuevoPartido.id_local} 
                      onChange={(e) => setNuevoPartido({ ...nuevoPartido, id_local: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="campo-admin">
                    <label>ID Visitante (Muestra)</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 8" 
                      value={nuevoPartido.id_visitante} 
                      onChange={(e) => setNuevoPartido({ ...nuevoPartido, id_visitante: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="campo-admin">
                  <label>Fecha y Hora</label>
                  <input type="datetime-local" value={nuevoPartido.fecha_hora} onChange={(e) => setNuevoPartido({ ...nuevoPartido, fecha_hora: e.target.value })} required />
                </div>

                <button type="submit" className="boton-admin-pro">Inyectar Partido</button>
              </form>
            </div>

            {/* TABLA DE MONITOREO */}
            <div className="columna-tabla">
              <div className="tabla-admin-contenedor">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'Orbitron', fontSize: '1rem' }}>Monitoreo Global de Partidos</h2>
                  <span style={{ color: '#00ff88', fontSize: '0.8rem' }}>● TIEMPO REAL</span>
                </div>
                
                {cargando ? (
                  <p style={{color: '#94a3b8', textAlign: 'center', padding: '20px'}}>Sincronizando flujos de datos...</p>
                ) : (
                  <table className="tabla-admin">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Local</th>
                        <th>Visitante</th>
                        <th>Programación</th>
                        <th style={{ textAlign: 'center', width: '180px' }}>Marcador Oficial</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partidos.map((p) => {
                        const marcadorFila = marcadoresEnTabla[p.id_partido] || { goles_local: '', goles_visitante: '' };
                        const esFinalizado = p.estado_partido === 'finalizado';

                        return (
                          <tr key={p.id_partido}>
                            <td style={{ color: '#00ff88', fontWeight: 'bold' }}>#{p.id_partido}</td>
                            <td>
                              <div className="admin-tabla-equipos">
                                {p.bandera_local && <img src={p.bandera_local} className="admin-banderita" alt="" />}
                                <span>{p.nombre_local || `Equipo ${p.id_local}`}</span>
                              </div>
                            </td>
                            <td>
                              <div className="admin-tabla-equipos">
                                {p.bandera_visitante && <img src={p.bandera_visitante} className="admin-banderita" alt="" />}
                                <span>{p.nombre_visitante || `Equipo ${p.id_visitante}`}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                <Clock size={12} /> {p.fecha_hora ? new Date(p.fecha_hora).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'}) : 'S/F'}
                              </div>
                            </td>
                            <td>
                              <div className="celda-marcador-interactiva">
                                {esFinalizado ? (
                                  <div className="marcador-estatico-final">
                                    {p.goles_local_real} : {p.goles_visitante_real}
                                  </div>
                                ) : (
                                  <div className="inputs-marcador-inline">
                                    <input 
                                      type="number" 
                                      min="0"
                                      placeholder="0"
                                      value={marcadorFila.goles_local}
                                      onChange={(e) => manejarCambioInputMarcador(p.id_partido, 'goles_local', e.target.value)}
                                      className="input-marcador-tabla"
                                    />
                                    <span className="separador-tabla-vs">:</span>
                                    <input 
                                      type="number" 
                                      min="0"
                                      placeholder="0"
                                      value={marcadorFila.goles_visitante}
                                      onChange={(e) => manejarCambioInputMarcador(p.id_partido, 'goles_visitante', e.target.value)}
                                      className="input-marcador-tabla"
                                    />
                                    <button
                                      type="button"
                                      className="boton-guardar-marcador-fila"
                                      onClick={() => manejarGuardarResultadoDirecto(p.id_partido)}
                                    >
                                      <CheckCircle2 size={15} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`badge-admin-estado ${p.estado_partido}`}>
                                {p.estado_partido}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;