import { Router } from 'express';
import * as pointsInteretController from '../controllers/pointsInteretController.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(pointsInteretController.lister)
  .post(requireAuth, pointsInteretController.creer);

router.route('/:id')
  .put(requireAuth, pointsInteretController.modifier)
  .delete(requireAuth, pointsInteretController.supprimer);

export default router;
