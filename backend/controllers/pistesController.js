import * as z from 'zod';
import PistesModel from '../models/PistesModel.js';
import { parseISODate } from '../lib/utils.js';
import { normArr, CATEGORIE_SQL } from '../lib/geo.js';
import { Reponse } from './util.js';

const listeQuerySchema = z.object({
  arrondissement: z.string().optional(),
  saisons4:       z.enum(['Oui', 'Non']).optional(),
  categorie:      z.enum(Object.keys(CATEGORIE_SQL)).optional(),
  populaireDebut: z.string().optional(),
  populaireFin:   z.string().optional(),
});

export async function lister(req, res) {
  const r = listeQuerySchema.safeParse(req.query);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Catégorie invalide. Valeurs acceptées : rev, voiePartagee, voieProtegee, sentierPolyvalent.'));
  }
  const { arrondissement, saisons4, categorie, populaireDebut, populaireFin } = r.data;

  let debutPop = null;
  let finPop   = null;
  if (populaireDebut !== undefined || populaireFin !== undefined) {
    if (!populaireDebut || !populaireFin) {
      return res.status(400).json(Reponse.erreur(400, 'Les paramètres populaireDebut et populaireFin doivent être fournis ensemble (format YYYY-MM-DD).'));
    }
    debutPop = parseISODate(populaireDebut);
    finPop   = parseISODate(populaireFin);
    if (!debutPop || !finPop) {
      return res.status(400).json(Reponse.erreur(400, 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).'));
    }
    if (debutPop > finPop) {
      return res.status(400).json(Reponse.erreur(400, 'populaireDebut doit être antérieur ou égal à populaireFin.'));
    }
  }

  try {
    let normArrIn;

    if (debutPop && finPop) {
      const popRows = await PistesModel.top3ArrondissementsPopulaires(debutPop, finPop);
      const top3 = popRows.map(r => normArr(r.arrondissement));
      if (!top3.length) {
        return res.json(Reponse.ok({ type: 'FeatureCollection', features: [] }));
      }
      normArrIn = top3;
    }

    const features = await PistesModel.listerFeatures({
      arrondissement,
      saisons4,
      categorieSql: categorie ? CATEGORIE_SQL[categorie] : undefined,
      normArrIn,
    });

    res.json(Reponse.ok({ type: 'FeatureCollection', features }));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}
