import { Router } from 'express';
import * as compteursController from '../controllers/compteursController.js';

const router = Router();

router.route('/').get(compteursController.lister);
router.route('/:id').get(compteursController.obtenir);
router.route('/:id/passages').get(compteursController.obtenirPassages);

export default router;
