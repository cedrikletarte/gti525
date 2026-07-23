import * as z from 'zod';
import CompteursModel, { INTERVALLES } from '../models/CompteursModel.js';
import { parseISODate } from '../lib/utils.js';
import { Reponse, paginationQuerySchema } from './util.js';

const listeQuerySchema = z.object({
  nom:            z.string().optional(),
  statut:         z.string().optional(),
  arrondissement: z.string().optional(),
  implantation:   z.coerce.number().int().optional(),
}).extend(paginationQuerySchema.shape);

export async function lister(req, res) {
  const r = listeQuerySchema.safeParse(req.query);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Paramètres de requête invalides.'));
  }
  const { nom, statut, arrondissement, implantation, limite, page } = r.data;
  const offset = (page - 1) * limite;

  try {
    const { donnees, total } = await CompteursModel.listerPagine({
      nom, statut, arrondissement, implantation, limite, offset,
    });
    res.json(Reponse.ok({ donnees, total, page, limite }));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}

export async function obtenir(req, res) {
  const { id } = req.params;
  try {
    const compteur = await CompteursModel.obtenirParId(id);
    if (!compteur) return res.status(404).json(Reponse.erreur(404, 'Compteur introuvable.'));
    res.json(Reponse.ok(compteur));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}

const passagesQuerySchema = z.object({
  intervalle: z.enum(['jour', 'semaine', 'mois']).default('jour'),
  debut:      z.string().optional(),
  fin:        z.string().optional(),
});

export async function obtenirPassages(req, res) {
  const { id } = req.params;

  // existe
  if (!/^\d+$/.test(id)) {
    return res.status(400).json(Reponse.erreur(400, 'Invalid counter identifier.'));
  }

  // valide
  const r = passagesQuerySchema.safeParse(req.query);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, `Intervalle invalide. Valeurs acceptées : ${Object.keys(INTERVALLES).join(', ')}.`));
  }
  const { intervalle, debut, fin } = r.data;

  let debutIso = null;
  let finIso   = null;

  if (debut !== undefined || fin !== undefined) {
    if (!debut || !fin) {
      return res.status(400).json(Reponse.erreur(400, 'Les paramètres debut et fin doivent être fournis ensemble (format YYYY-MM-DD).'));
    }
    debutIso = parseISODate(debut);
    finIso   = parseISODate(fin);
    if (!debutIso || !finIso) {
      return res.status(400).json(Reponse.erreur(400, 'Format de date invalide. Utilisez YYYY-MM-DD (ex. 2022-01-01).'));
    }
    if (debutIso > finIso) {
      return res.status(400).json(Reponse.erreur(400, 'La date de début doit être antérieure ou égale à la date de fin.'));
    }
  }

  // calcule
  try {
    const rows = await CompteursModel.obtenirPassagesAgreges(id, { intervalle, debutIso, finIso });

    if (rows.length === 0) {
      return res.status(404).json(Reponse.erreur(404, 'No data found for this counter in the requested period.'));
    }

    res.json(Reponse.ok(rows));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}
