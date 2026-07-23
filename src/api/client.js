const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/gti525/v1';

let jeton = localStorage.getItem("jeton");

export function definirJeton(nouveauJeton) {
    jeton = nouveauJeton;

    if (nouveauJeton) {
        localStorage.setItem("jeton", nouveauJeton);
    } else {
        localStorage.removeItem("jeton");
    }
}

export function obtenirJeton() {
    return jeton;
}

async function requeteApiSecure(chemin, options = {}) {
    const reponse = await fetch(`${BASE_URL}${chemin}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (reponse.status === 401) {
        // Le jeton n'est plus valide (expiré, révoqué, etc.) : on nettoie l'état local.
        definirJeton(null);
    }

    return reponse;
}

async function requeteApi(chemin, options = {}) {
    const reponse = await fetch(`${BASE_URL}${chemin}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    return reponse;
}

// Tente de parser le corps JSON d'une réponse; retourne null si le corps est
// vide ou non-JSON (ex: 204 No Content, page d'erreur HTML d'un 500, etc.)
async function parserJsonSecurise(reponse) {
    try {
        return await reponse.json();
    } catch {
        return null;
    }
}

export async function inscrire(courriel, motDePasse) {
    const reponse = await requeteApiSecure('/auth/inscription', {
        method: 'POST',
        body: JSON.stringify({ courriel, motDePasse }),
    });
    const donnees = await parserJsonSecurise(reponse);
    return { ok: reponse.ok, statut: reponse.status, donnees };
}

export async function connecter(courriel, motDePasse) {
    const reponse = await requeteApiSecure('/auth/connexion', {
        method: 'POST',
        body: JSON.stringify({ courriel, motDePasse }),
    });
    const donnees = await parserJsonSecurise(reponse);
    if (reponse.ok && donnees?.data?.jeton) {
        definirJeton(donnees.data.jeton);
    }
    return { ok: reponse.ok, statut: reponse.status, donnees };
}

export function deconnecter() {
    definirJeton(null);
}

export async function obtenirUtilisateurCourant() {
    if (!jeton || jeton === "") return null;
    const reponse = await requeteApiSecure('/auth/moi', { method: 'GET' });
    if (!reponse.ok) return null;
    const donnees = await parserJsonSecurise(reponse);
    return donnees?.data?.utilisateur ?? null;
}

export async function creerPointInteret(point) {
    const reponse = await requeteApiSecure("/pointsdinteret", {
        method: "POST",
        body: JSON.stringify(point),
    });

    const donnees = await parserJsonSecurise(reponse);

    return {
        ok: reponse.ok,
        statut: reponse.status,
        donnees,
        erreur: !reponse.ok ? (donnees?.message ?? "Erreur lors de la création.") : undefined,
    };
}

export async function modifierPointInteret(id, point) {
    const reponse = await requeteApiSecure(`/pointsdinteret/${id}`, {
        method: "PUT",
        body: JSON.stringify(point),
    });

    const donnees = await parserJsonSecurise(reponse);

    return {
        ok: reponse.ok,
        statut: reponse.status,
        donnees,
        erreur: !reponse.ok ? (donnees?.message ?? "Erreur lors de la modification.") : undefined,
    };
}

export async function supprimerPointInteret(id) {
    const reponse = await requeteApiSecure(`/pointsdinteret/${id}`, {
        method: "DELETE",
    });

    const donnees = await parserJsonSecurise(reponse);

    return {
        ok: reponse.ok,
        statut: reponse.status,
        erreur: !reponse.ok ? (donnees?.message ?? "Erreur lors de la suppression.") : undefined,
    };
}

export async function obtenirPistesPopulaires(payload) {
    const reponse = await requeteApi(`/pistes?populaireDebut=${payload.populaireDebut}&populaireFin=${payload.populaireFin}`, {
        method: "GET",
    });

    const donnees = await parserJsonSecurise(reponse);

    return {
        ok: reponse.ok,
        statut: reponse.status,
        erreur: !reponse.ok ? (donnees?.message ?? "Erreur lors de la requête.") : undefined,
        donnees: donnees
    }
}