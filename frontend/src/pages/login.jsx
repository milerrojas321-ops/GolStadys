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

  const manejarEnvioCorreo = (e) => {
    e.preventDefault();
    if (correo) {
      console.log(`Solicitando código para: ${correo}`);
      setCodigoEnviado(true);
    }
  };

  const manejarVerificarCodigo = (e) => {
    e.preventDefault();
    if (codigoOtp) {
      console.log(`Verificando código: ${codigoOtp}`);
      // Simulamos que el backend detecta que es un usuario nuevo:
      setRequierePerfil(true);
    }
  };

  const manejarGuardarPerfil = (e) => {
    e.preventDefault();
    if (nombreCompleto) {
      console.log(`Guardando perfil para: ${nombreCompleto}`);
      
      // Activa el interruptor en App.jsx para pasar al Menú Principal
      alIniciarSesion();
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
        
        {/* PASO 1: Pedir Correo */}
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
                className="input"
              />
            </div>
            <button type="submit" className="boton-principal">
              Enviar Código de Acceso
            </button>
          </form>
        )}

        {/* PASO 2: Pedir OTP */}
        {codigoEnviado && !requierePerfil && (
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
                className="input input-centrado"
              />
            </div>
            
            <button type="submit" className="boton-principal">
              Ingresar al Estadio
            </button>
            
            <button 
              type="button" 
              onClick={() => setCodigoEnviado(false)}
              className="boton-volver"
            >
              Cambiar correo electrónico
            </button>
          </form>
        )}

        {/* PASO 3: Post-Registro */}
        {requierePerfil && (
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
                className="input"
              />
            </div>
            
            <button type="submit" className="boton-principal">
              Empezar a Jugar
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;