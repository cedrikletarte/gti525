import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

router.route('/inscription').post(authController.inscription);
router.route('/connexion').post(authController.connexion);
router.route('/moi').get(requireAuth, authController.moi);

export default router;
