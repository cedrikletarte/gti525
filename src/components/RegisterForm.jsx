import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircularProgress from '@mui/material/CircularProgress';
import {useNavigate} from 'react-router-dom'

import { inscrire } from '../api/client.js';
import { useValidationMotDePasse, estEmailValide } from '../hooks/useValidationMotDePasse';

export default function RegisterForm({ onSuccesInscription }) {
    const [courriel, setCourriel] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [etat, setEtat] = useState('inactif'); // inactif | chargement | erreur | succes
    const [messageErreur, setMessageErreur] = useState('');

    const { regles, toutesValides } = useValidationMotDePasse(motDePasse);
    const emailTouche = courriel.length > 0;
    const emailValide = estEmailValide(courriel);
    const confirmationTouchee = confirmation.length > 0;
    const motsDePasseCorrespondent = motDePasse === confirmation;

    const formulaireValide = emailValide && toutesValides && motsDePasseCorrespondent && confirmationTouchee;

    const navigate = useNavigate();

    async function gererEnvoi(e) {
        e.preventDefault();
        if (!formulaireValide) return;

        setEtat('chargement');
        setMessageErreur('');

        const { ok, donnees } = await inscrire(courriel, motDePasse);

        if (ok) {
            setEtat('succes');
            onSuccesInscription && onSuccesInscription(donnees.utilisateur);
            navigate('/connexion')

        } else {
            setEtat('erreur');
            setMessageErreur(donnees.message || 'Une erreur est survenue.');
        }
    }

    return (
        <Box component="form" onSubmit={gererEnvoi} noValidate sx={{mt: "25px"}}>
            <Typography variant="h5" gutterBottom>
                Créer un compte
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                    id="courriel-inscription"
                    label="Courriel"
                    type="email"
                    value={courriel}
                    onChange={(e) => setCourriel(e.target.value)}
                    autoComplete="email"
                    required
                    fullWidth
                    error={emailTouche && !emailValide}
                    helperText={emailTouche && !emailValide ? 'Format de courriel invalide.' : ' '}
                />

                <TextField
                    id="mdp-inscription"
                    label="Mot de passe"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    autoComplete="new-password"
                    required
                    fullWidth
                />

                <List dense disablePadding sx={{ mt: -1.5 }}>
                    {regles.map((regle) => (
                        <ListItem key={regle.cle} disableGutters sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                {regle.valide ? (
                                    <CheckCircleIcon fontSize="small" color="success" />
                                ) : (
                                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={regle.label}
                            />
                        </ListItem>
                    ))}
                </List>

                <TextField
                    id="confirmation-inscription"
                    label="Confirmer le mot de passe"
                    type="password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    autoComplete="new-password"
                    required
                    fullWidth
                    error={confirmationTouchee && !motsDePasseCorrespondent}
                    helperText={
                        confirmationTouchee && !motsDePasseCorrespondent
                            ? 'Les mots de passe ne correspondent pas.'
                            : ' '
                    }
                />

                {etat === 'erreur' && <Alert severity="error">{messageErreur}</Alert>}
                {etat === 'succes' && <Alert severity="success">Compte créé avec succès.</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!formulaireValide || etat === 'chargement'}
                    startIcon={etat === 'chargement' ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {etat === 'chargement' ? 'Création en cours…' : "S'inscrire"}
                </Button>
            </Stack>
        </Box>
    );
}
