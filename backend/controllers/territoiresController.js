import TerritoiresModel from '../models/TerritoiresModel.js';
import { Reponse } from './util.js';

export async function lister(_req, res) {
  try {
    const features = await TerritoiresModel.listerFeatures();
    res.json(Reponse.ok({ type: 'FeatureCollection', features }));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}
