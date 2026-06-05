import React, { useState } from 'react';
import Login from './pages/Login'; // Asegúrate de que la ruta a tu Login sea correcta
import MenuPrincipal from './pages/menuPrincipal';
import adminDashboard from './pages/adminDashboard';

function App() {
  // Estado para controlar qué vista se muestra en toda la app
  const [pantallaActual, setPantallaActual] = useState('login');

  return (
    <>
      {pantallaActual === 'login' && (
        <Login alIniciarSesion={() => setPantallaActual('menu')} />
      )}
      
      {pantallaActual === 'menu' && (
        <MenuPrincipal />
      )}

      {pantallaActual === 'admin' && (
        <adminDashboard />
      )}
    </>
  );
}

export default App;