import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate} from 'react-router-dom'


import { connecter } from '../api/authClient.js';
import { estEmailValide } from '../hooks/useValidationMotDePasse';

export default function LoginForm({ onSuccesConnexion }) {
    const [courriel, setCourriel] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [etat, setEtat] = useState('inactif'); // inactif | chargement | erreur | succes
    const [messageErreur, setMessageErreur] = useState('');

    const formulaireValide = estEmailValide(courriel) && motDePasse.length > 0;

    const navigate = useNavigate()

    async function gererEnvoi(e) {
        e.preventDefault();
        if (!formulaireValide) return;

        setEtat('chargement');
        setMessageErreur('');

        const { ok, donnees } = await connecter(courriel, motDePasse);

        if (ok) {
            setEtat('succes');
            onSuccesConnexion && onSuccesConnexion(donnees.utilisateur);
            navigate('/');
        } else {
            setEtat('erreur');
            // Message générique renvoyé par le backend, jamais "email inconnu" vs "mdp incorrect"
            setMessageErreur(donnees.message || 'Une erreur est survenue.');
        }
    }

    return (
        <Box component="form" onSubmit={gererEnvoi} noValidate>
            <Typography variant="h5" gutterBottom>
                Se connecter
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    id="courriel-connexion"
                    label="Courriel"
                    type="email"
                    value={courriel}
                    onChange={(e) => setCourriel(e.target.value)}
                    autoComplete="email"
                    required
                    fullWidth
                />

                <TextField
                    id="mdp-connexion"
                    label="Mot de passe"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    autoComplete="current-password"
                    required
                    fullWidth
                />

                {etat === 'erreur' && <Alert severity="error">{messageErreur}</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!formulaireValide || etat === 'chargement'}
                    startIcon={etat === 'chargement' ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {etat === 'chargement' ? 'Connexion en cours…' : 'Se connecter'}
                </Button>
            </Stack>
        </Box>
    );
}
