import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import Navbar from '../components/Navbar';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Réseau cyclable',
    description:
      'Visualisez les 9 000+ segments de pistes, filtrez par catégorie et découvrez les pistes populaires.',
  },
  {
    icon: '📊',
    title: 'Statistiques',
    description:
      'Consultez les données de passage de chaque compteur et analysez les tendances saisonnières.',
  },
  {
    icon: '💬',
    title: 'Assistant',
    description:
      "Posez des questions en français sur le réseau ; l'assistant interroge la base en temps réel.",
  },
];

export default function HomePage({ segmentsCount, totalKm, countersCount }) {
  const stats = [
    { value: segmentsCount ?? '8 088', label: 'Segments de pistes' },
    { value: totalKm ?? '970.4 km', label: 'Longueur totale du réseau' },
    { value: countersCount ?? '64', label: 'Compteurs vélo' },
  ];

  return (
    <>
      <header>
        <Navbar activePage="Accueil" />
      </header>

      <main>
        {/* Hero */}
        <Box
          component="section"
          sx={{
            background: 'linear-gradient(to right, #1f5b2c, #2a763b)',
            py: { xs: 6, md: 10 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
              MTL Vélo
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', maxWidth: 640, mx: 'auto' }}>
              Explorez et gérez le réseau cyclable de la Ville de Montréal — pistes, compteurs,
              points d'intérêt et statistiques en temps réel.
            </Typography>
          </Container>
        </Box>

        {/* Stats */}
        <Box component="section" sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f5f5f5' }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {stats.map(({ value, label }) => (
                <Grid key={label} size={{ xs: 12, sm: 4 }}>
                  <Paper elevation={2} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
                      {value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Feature cards */}
        <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {FEATURES.map(({ icon, title, description }) => (
                <Grid key={title} size={{ xs: 12, sm: 4 }}>
                  <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                      <Typography variant="h2" component="span" role="img" aria-label={title}>
                        {icon}
                      </Typography>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ color: 'primary.main', fontWeight: 700, mt: 2, mb: 1 }}
                      >
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </main>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} MTL Vélo — Données ouvertes Ville de Montréal
          </Typography>
        </Container>
      </Box>
    </>
  );
}
