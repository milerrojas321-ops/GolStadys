import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/conexion_db.js'; // Tu conexión que ya funciona
import authRoutes from './routes/auth_routes.js'; 
import apiRutas from './routes/api_routes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors()); // Permite que tu React se conecte sin bloqueos
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON

// Registrar las rutas en la aplicación
app.use('/api/auth', authRoutes); // 👈 2. ACTIVA LAS RUTAS DE AUTENTICACIÓN AQUÍ

// Usamos el prefijo /api para estas consultas de vistas
app.use('/api', apiRutas);

// Ruta de prueba inicial para verificar el estado del servidor
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor de GolStadys corriendo perfectamente' });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en: http://localhost:${PORT}`);
});