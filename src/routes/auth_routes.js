import { Router } from 'express';
import { solicitarCodigo, verificarCodigo, completarPerfil } from '../controllers/auth_controller.js';

const router = Router();

router.post('/solicitar-otp', solicitarCodigo);
router.post('/verificar-codigo', verificarCodigo);
router.post('/completar-perfil', completarPerfil);

export default router;