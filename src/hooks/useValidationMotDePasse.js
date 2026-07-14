import { useMemo } from 'react';

// Doit rester cohérent avec backend/src/utils/validators.js
const LONGUEUR_MIN = 12;

export function useValidationMotDePasse(motDePasse) {
    return useMemo(() => {
        const regles = [
            { cle: 'longueur', label: `Au moins ${LONGUEUR_MIN} caractères`, valide: motDePasse.length >= LONGUEUR_MIN },
            { cle: 'majuscule', label: 'Une majuscule', valide: /[A-Z]/.test(motDePasse) },
            { cle: 'minuscule', label: 'Une minuscule', valide: /[a-z]/.test(motDePasse) },
            { cle: 'chiffre', label: 'Un chiffre', valide: /[0-9]/.test(motDePasse) },
            { cle: 'special', label: 'Un caractère spécial', valide: /[^A-Za-z0-9]/.test(motDePasse) },
        ];
        const toutesValides = regles.every((r) => r.valide);
        return { regles, toutesValides };
    }, [motDePasse]);
}

export function estEmailValide(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
