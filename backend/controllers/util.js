import * as z from 'zod';

// Enveloppe de réponse uniforme : { code, message, data }.
// Le routeur déclare les URL, le contrôleur traite la requête et formate la
// réponse via cette classe, le modèle parle aux données. Chacun ne fait
// qu'une chose.
export class Reponse {
  constructor(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static ok(data) {
    return new Reponse(200, 'OK', data);
  }

  static erreur(code, message, data = null) {
    return new Reponse(code, message, data);
  }
}

// Schéma de pagination partagé par les listes paginées (compteurs, pointsdinteret).
export const paginationQuerySchema = z.object({
  limite: z.coerce.number().int().min(1).default(20),
  page:   z.coerce.number().int().min(1).default(1),
});

// Construit un message d'erreur lisible à partir des issues Zod.
export function messageDepuisIssues(issues) {
  return issues.map((i) => `${i.path.join('.') || '(racine)'} : ${i.message}`).join(' ; ');
}
