import { Router } from 'express';
import * as assistantController from '../controllers/assistantController.js';

const router = Router();

router.route('/').post(assistantController.poserQuestion);
router.route('/signalement').post(assistantController.signalerReponse);

export default router;
