import { Router } from 'express';
import * as territoiresController from '../controllers/territoiresController.js';

const router = Router();

router.route('/').get(territoiresController.lister);

export default router;
