import { Router } from 'express';
import { solicitarCodigo, verificarCodigo, completarPerfil } from '../controllers/auth_controller.js';

const router = Router();

// Corregido: Llamamos directamente a la función importada sin el prefijo "authController."
router.post('/login/enviar-codigo', solicitarCodigo);
router.post('/verificar-codigo', verificarCodigo);
router.post('/completar-perfil', completarPerfil);

export default router;