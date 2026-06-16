// src/App.jsx
import React, { useState, useEffect } from 'react';
import IniciarSesion from "./pages/login";
import MenuPrincipal from './pages/menuPrincipal';
import AdminDashboard from './pages/adminDashboard';

function App() {
  const [pantallaActual, setPantallaActual] = useState('login');
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  const verificarYDireccionarSesion = () => {
    const token = localStorage.getItem('token_golstadys');
    const datosUsuario = localStorage.getItem('usuario');
    
    if (token) {
      if (datosUsuario) {
        setUsuarioActivo(JSON.parse(datosUsuario));
      }

      const partes = token.split('_');
      if (partes.length >= 4 && partes[3] === 'admin') {
        setPantallaActual('admin');
      } else {
        setPantallaActual('menu');
      }
    } else {
      setPantallaActual('login');
      setUsuarioActivo(null);
    }
  };

  useEffect(() => {
    verificarYDireccionarSesion();
    setCargandoSesion(false);
  }, []);

  const manejarCerrarSesion = () => {
    localStorage.removeItem('token_golstadys'); 
    localStorage.removeItem('usuario'); 
    setUsuarioActivo(null);              
    setPantallaActual('login');                 
  };

  if (cargandoSesion) {
    return (
      <div style={{ background: '#0f172a', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <p>Verificando sesión en GolStadys...</p>
      </div>
    );
  }

  return (
    <>
      {pantallaActual === 'login' && (
        <IniciarSesion alIniciarSesion={verificarYDireccionarSesion} />
      )}
      
      {pantallaActual === 'menu' && (
        <MenuPrincipal alCerrarSesion={manejarCerrarSesion} usuarioGlobal={usuarioActivo} />
      )}

      {pantallaActual === 'admin' && (
        <AdminDashboard alCerrarSesion={manejarCerrarSesion} usuarioGlobal={usuarioActivo} />
      )}
    </>
  );
}

export default App;