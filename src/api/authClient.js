const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/gti525/v1';

let jeton = null;

export function definirJeton(nouveauJeton) {
    jeton = nouveauJeton;
}

export function obtenirJeton() {
    return jeton;
}

async function requeteApi(chemin, options = {}) {
    const reponse = await fetch(`${BASE_URL}${chemin}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
            ...(options.headers || {}),
        },
    });
    return reponse;
}

export async function inscrire(courriel, motDePasse) {
    const reponse = await requeteApi('/auth/inscription', {
        method: 'POST',
        body: JSON.stringify({ courriel, motDePasse }),
    });
    const donnees = await reponse.json();
    return { ok: reponse.ok, statut: reponse.status, donnees };
}

export async function connecter(courriel, motDePasse) {
    const reponse = await requeteApi('/auth/connexion', {
        method: 'POST',
        body: JSON.stringify({ courriel, motDePasse }),
    });
    const donnees = await reponse.json();
    if (reponse.ok && donnees.jeton) {
        definirJeton(donnees.jeton);
    }
    return { ok: reponse.ok, statut: reponse.status, donnees };
}

export function deconnecter() {
    definirJeton(null);
}

export async function obtenirUtilisateurCourant() {
    if(!jeton()) return;
    const reponse = await requeteApi('/auth/moi', { method: 'GET' });
    if (!reponse.ok) return null;
    const donnees = await reponse.json();
    return donnees.utilisateur;
}