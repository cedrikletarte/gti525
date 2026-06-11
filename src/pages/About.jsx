import { Box, Container, Paper, Typography } from '@mui/material';
import Navbar from '../components/Navbar';

const DATA_SOURCES = [
  'Compteurs de vélos (emplacements et passages)',
  'Réseau cyclable (9 100+ segments de pistes)',
  "Fontaines d'eau potable",
  'Délimitations des arrondissements',
];

const TECHNOLOGIES = [
  { label: 'Dorsale', value: 'Node.js, Express, SQLite' },
  { label: 'Cartographie', value: 'Leaflet' },
  { label: 'Graphiques', value: 'Material UI' },
  { label: 'Interface', value: 'Vite + React' },
];

function SectionTitle({ children }) {
  return (
    <Typography
      variant="h6"
      component="h2"
      sx={{ fontWeight: 700, color: 'primary.main', mt: 4, mb: 1.5 }}
    >
      {children}
    </Typography>
  );
}

export default function About() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <header>
        <Navbar activePage="À propos" />
      </header>

      <main>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
          <Paper
            elevation={1}
            sx={{
              maxWidth: 720,
              mx: 'auto',
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              textAlign: 'left',
            }}
          >
            {/* Titre principal */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              À propos de MTL Vélo
            </Typography>

            {/* Source des données */}
            <SectionTitle>Source des données</SectionTitle>
            <Typography variant="body2" color="text.secondary">
              Les données utilisées dans cette application proviennent des{' '}
              <strong>Données ouvertes de la Ville de Montréal</strong> :
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
              {DATA_SOURCES.map((item) => (
                <Typography key={item} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {item}
                </Typography>
              ))}
            </Box>

            {/* Technologies */}
            <SectionTitle>Technologies</SectionTitle>
            <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
              {TECHNOLOGIES.map(({ label, value }) => (
                <Typography key={label} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  <strong>{label} :</strong> {value}
                </Typography>
              ))}
            </Box>

            {/* Contexte pédagogique */}
            <SectionTitle>Contexte pédagogique</SectionTitle>
            <Typography variant="body2" color="text.secondary">
              Ce projet est réalisé dans le cadre du cours{' '}
              <strong>GTI525 — Technologies des applications web</strong>. Il illustre
              l'intégration d'un front-end SPA, d'une API REST sécurisée et d'un assistant
              conversationnel ancré sur des données réelles.
            </Typography>

            {/* Compte de démonstration */}
            <SectionTitle>Compte de démonstration</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Courriel : <Box component="code" sx={{ fontFamily: 'monospace' }}>demo@gti525.ca</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mot de passe : <Box component="code" sx={{ fontFamily: 'monospace' }}>Demo2026!</Box>
            </Typography>
          </Paper>
        </Container>
      </main>
    </Box>
  );
}
