// src/routes/api_routes.js
import express from 'express';
import { obtenerTorneos } from '../controllers/torneo_controller.js'; 
import { 
  obtenerPartidosPorTorneo, 
  obtenerTodosLosPartidos,
  crearNuevoPartido,
  registrarMarcadorOficial,
  obtenerTodasLasSelecciones
} from '../controllers/partido_controller.js';
import { registrarApuesta, obtenerApuestasUsuario } from '../controllers/apuesta_controller.js';
import { obtenerRanking } from '../controllers/auth_controller.js';

const router = express.Router();

router.get('/torneos', obtenerTorneos);
router.get('/partidos/:id_torneo', obtenerPartidosPorTorneo);
router.get('/partidos', obtenerTodosLosPartidos);

//Rutas de escritura del Command Center Administrativo
router.post('/partidos', crearNuevoPartido);
router.post('/partidos/:id_partido/resultado', registrarMarcadorOficial);

// Endpoints del módulo analítico de apuestas
router.post('/apuestas', registrarApuesta);
router.get('/apuestas/usuario/:id_usuario', obtenerApuestasUsuario);
router.get('/ranking', obtenerRanking);
router.get('/selecciones', obtenerTodasLasSelecciones);

export default router;