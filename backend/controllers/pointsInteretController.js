import * as z from 'zod';
import PointsInteretModel from '../models/PointsInteretModel.js';
import { Reponse, paginationQuerySchema } from './util.js';

const listeQuerySchema = z.object({
  nom:            z.string().optional(),
  type:           z.string().optional(),
  arrondissement: z.string().optional(),
}).extend(paginationQuerySchema.shape);

export async function lister(req, res) {
  const r = listeQuerySchema.safeParse(req.query);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Paramètres de requête invalides.'));
  }
  const { nom, type, arrondissement, limite, page } = r.data;
  const offset = (page - 1) * limite;

  try {
    const { donnees, total } = await PointsInteretModel.listerPagine({
      nom, type, arrondissement, limite, offset,
    });
    res.json(Reponse.ok({ donnees, total, page, limite }));
  } catch {
    res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}

const creerBodySchema = z.object({
  nom_parc_lieu:          z.string().min(1),
  latitude:               z.coerce.number(),
  longitude:              z.coerce.number(),
  arrondissement:         z.string().nullable().optional(),
  proximite_jeux_repere:  z.string().nullable().optional(),
  intersection:           z.string().nullable().optional(),
  etat:                   z.string().nullable().optional(),
  date_installation:      z.string().nullable().optional(),
  remarque:               z.string().nullable().optional(),
  precision_localisation: z.string().nullable().optional(),
  x:                      z.coerce.number().nullable().optional(),
  y:                      z.coerce.number().nullable().optional(),
  type:                   z.string().nullable().optional(),
});

export async function creer(req, res) {
  const body = req.body ?? {};
  const r = creerBodySchema.safeParse(body);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Champs requis : nom_parc_lieu, latitude, longitude.'));
  }
  try {
    const id = await PointsInteretModel.creer(r.data);
    return res.status(201).json(Reponse.ok({ id, ...body }));
  } catch {
    return res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}

const idParamSchema = z.coerce.number().int();
const modifierBodySchema = creerBodySchema.partial();

export async function modifier(req, res) {
  const idResult = idParamSchema.safeParse(req.params.id);
  if (!idResult.success || Number.isNaN(idResult.data)) {
    return res.status(400).json(Reponse.erreur(400, 'Identifiant invalide.'));
  }
  const poiId = idResult.data;

  const body = req.body ?? {};
  const r = modifierBodySchema.safeParse(body);
  if (!r.success) {
    return res.status(400).json(Reponse.erreur(400, 'Paramètres de requête invalides.'));
  }

  try {
    const existe = await PointsInteretModel.existe(poiId);
    if (!existe) return res.status(404).json(Reponse.erreur(404, "Point d'intérêt introuvable."));

    await PointsInteretModel.modifier(poiId, r.data);
    return res.status(200).json(Reponse.ok({ id: poiId, ...body }));
  } catch {
    return res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}

export async function supprimer(req, res) {
  const idResult = idParamSchema.safeParse(req.params.id);
  if (!idResult.success || Number.isNaN(idResult.data)) {
    return res.status(400).json(Reponse.erreur(400, 'Identifiant invalide.'));
  }
  const poiId = idResult.data;

  try {
    const existe = await PointsInteretModel.existe(poiId);
    if (!existe) return res.status(404).json(Reponse.erreur(404, "Point d'intérêt introuvable."));

    await PointsInteretModel.supprimer(poiId);
    return res.status(204).send();
  } catch {
    return res.status(500).json(Reponse.erreur(500, 'Database query failed.'));
  }
}
