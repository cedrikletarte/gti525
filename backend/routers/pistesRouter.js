import { Router } from 'express';
import * as pistesController from '../controllers/pistesController.js';

const router = Router();

router.route('/').get(pistesController.lister);

export default router;
