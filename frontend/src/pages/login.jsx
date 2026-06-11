import React, { useState } from 'react';
import logoGolStadys from '../assets/logo.png';
import './Login.css'; // Conexión directa con tus estilos CSS en limpio

function Login({ alIniciarSesion }) {
  // 1. LÓGICA DE JAVASCRIPT (Estados y Funciones)
  const [correo, setCorreo] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [requierePerfil, setRequierePerfil] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  
  // Estados añadidos para dar feedback visual de carga o errores
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // PASO 1: Solicitar código OTP al Backend
  const manejarEnvioCorreo = async (e) => {
    e.preventDefault();
    if (!correo) return;

    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch('http://localhost:5000/api/auth/solicitar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo_electronico: correo })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al solicitar el código');
      }

      console.log(`Solicitando código para: ${correo}`);
      
      // Guardamos la bandera y activamos que el código fue enviado para ir al Paso 2.
      setRequierePerfil(datos.requiereRegistroCompleto); 
      setCodigoEnviado(true); 
      
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // PASO 2: Verificar el código OTP digitado por el usuario (Antiguos / Nuevos)
  const manejarVerificarCodigo = async (e) => {
    e.preventDefault();
    if (!codigoOtp) return;

    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch('http://localhost:5000/api/auth/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo_electronico: correo, codigo_otp: codigoOtp })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Código incorrecto o expirado');
      }

      console.log(`Verificando código: ${codigoOtp}`);
      
      // Guardamos el token JWT para peticiones seguras si tu backend lo usa
      if (datos.token) {
        localStorage.setItem('token_golstadys', datos.token);
      }

      if (requierePerfil) {
        // Si el backend dijo en el Paso 1 que no tenía nombre, ocultamos el OTP y abrimos el formulario del perfil
        setCodigoEnviado(false); 
      } else {
        // 🟢 CORRECCIÓN DE MAPEO EXACTO:
        // Como tu backend devuelve 'id' y 'nombre_completo' directamente en 'datos' o dentro de 'datos.usuario':
        const usuarioReal = datos.usuario || datos;

        const sesionUsuario = {
          id_usuario: usuarioReal.id, // Mapeamos el 'id' de la BD a 'id_usuario' que usa el Front
          nombre: usuarioReal.nombre_completo, // Mapeamos 'nombre_completo'
          rol: usuarioReal.rol || 'user'
        };

        // Guardamos de forma limpia el objeto estructurado
        localStorage.setItem('usuario', JSON.stringify(sesionUsuario));
        
        // Entra directo al estadio
        alIniciarSesion();
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // PASO 3: Guardar el perfil inicial (Nombre Completo) de los usuarios nuevos
  const manejarGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!nombreCompleto) return;

    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch('http://localhost:5000/api/auth/completar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo_electronico: correo, nombre_completo: nombreCompleto })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al guardar el nombre');
      }

      console.log(`Guardando perfil para: ${nombreCompleto}`);

      // Construimos el objeto de sesión con la respuesta del registro exitoso
      const sesionUsuarioNuevo = {
        id_usuario: datos.id_usuario || datos.id || datos.usuario?.id_usuario,
        nombre: nombreCompleto,
        rol: datos.rol || 'user'
      };

      localStorage.setItem('usuario', JSON.stringify(sesionUsuarioNuevo));

      alIniciarSesion();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // 2. INTERFAZ VISUAL ENLAZADA A CSS
  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        
        {/* Encabezado fijo de la App (Siempre visible) */}
        <div className="header">
          <img 
            src={logoGolStadys} 
            alt="Logo GolStadys" 
            className="logo-imagen" 
          />
          <p className="subtitulo">Tu pase directo a los mejores pronósticos</p>
        </div>

        {/* Notificación de errores en caso de fallos de red o datos inválidos */}
        {error && (
          <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {/* PASO 1: Pedir Correo (Solo visible al inicio) */}
        {!codigoEnviado && !requierePerfil && (
          <form onSubmit={manejarEnvioCorreo} className="formulario">
            <div className="grupo-input">
              <label className="etiqueta">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
                className="input"
              />
            </div>
            <button type="submit" disabled={cargando} className="boton-principal">
              {cargando ? 'Solicitando...' : 'Enviar Código de Acceso'}
            </button>
          </form>
        )}

        {/* PASO 2: Pedir OTP */}
        {codigoEnviado && (
          <form onSubmit={manejarVerificarCodigo} className="formulario">
            <div className="alerta-envio">
              Hemos enviado un código de 6 dígitos a: <br />
              <strong>{correo}</strong>
            </div>
            
            <div className="grupo-input">
              <label className="etiqueta">Código de Verificación</label>
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000"
                value={codigoOtp}
                onChange={(e) => setCodigoOtp(e.target.value)}
                required
                disabled={cargando}
                className="input input-centrado"
              />
            </div>
            
            <button type="submit" disabled={cargando} className="boton-principal">
              {cargando ? 'Verificando...' : 'Ingresar al Estadio'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setCodigoEnviado(false); setRequierePerfil(false); setError(''); }}
              disabled={cargando}
              className="boton-volver"
            >
              Cambiar correo electrónico
            </button>
          </form>
        )}

        {/* PASO 3: Post-Registro */}
        {!codigoEnviado && requierePerfil && (
          <form onSubmit={manejarGuardarPerfil} className="formulario">
            <div className="alerta-envio">
              ¡Felicidades! Tu correo ha sido verificado.
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: '10px 0 5px 0', textAlign: 'center' }}>
              🛸 Configura tu perfil
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 0, textAlign: 'center' }}>
              Para aparecer en el ranking del torneo, necesitamos saber quién eres.
            </p>
            
            <div className="grupo-input">
              <label className="etiqueta">Nombre y Apellido</label>
              <input 
                type="text" 
                placeholder="Ej: Juan Pérez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
                disabled={cargando}
                className="input"
              />
            </div>
            
            <button type="submit" disabled={cargando} className="boton-principal">
              {cargando ? 'Guardando...' : 'Empezar a Jugar'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;