import {useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { deconnecter, obtenirUtilisateurCourant } from '../api/client.js';
import {useNavigate} from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Réseau', path: '/reseau' },
  { label: 'Statistiques', path: '/statistiques' },
  { label: "Points d'intérêt", path: '/points-interet' },
  { label: 'Assistant', path: '/assistant' },
  { label: 'À propos', path: '/a-propos' },
];

export default function Navbar({ activePage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [utilisateur, setUtilisateur] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
      obtenirUtilisateurCourant()
          .then(setUtilisateur)
      }, [])

  function gererDeconnexion() {
      deconnecter();
      setUtilisateur(null);
      navigate("/")
  }

  const linkSx = (label) => ({
    color: activePage === label ? 'primary.main' : 'text.muted',
    mx: 0.5,
    borderBottom: activePage === label ? '2px solid' : '2px solid transparent',
    borderColor: activePage === label ? 'primary.main' : 'transparent',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: 'rgba(45,106,79,0.06)',
      color: 'primary.main',
      borderBottom: '2px solid',
      borderColor: 'primary.main',
    },
  });

  const drawer = (
    <Box sx={{ width: 260 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          🚲 MTL Vélo
        </Typography>
      </Box>
      <Divider />
      <List>
        {NAV_LINKS.map(({ label, path }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              selected={activePage === label}
              onClick={() => setDrawerOpen(false)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(45,106,79,0.12)',
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                },
              }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
        {utilisateur ? (
                <Box sx={{display: "flex", gap: 2, flexDirection: 'column'}}>
                    <Typography  sx={{pt: "12px", pl: "12px"}}>Bonjour {utilisateur.courriel}</Typography>
                    <Button variant="outlined" onClick={gererDeconnexion}>
                        Se déconnecter
                    </Button>
                </Box>
            ) :(
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button component={Link} to={"/connexion"}  variant="outlined" color="primary" fullWidth>
          Connexion
        </Button>
        <Button component={Link} to={"/inscription"}  variant="contained" color="primary" fullWidth>
          Inscription
        </Button>
      </Box>
            )}
    </Box>
  );

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 },
            textDecoration: 'none',
          }}
        >
          🚲 MTL Vélo
        </Typography>

        {/* Desktop nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          {NAV_LINKS.map(({ label, path }) => (
            <Button key={label} component={Link} to={path} sx={linkSx(label)}>
              {label}
            </Button>
          ))}
        </Box>

        {/* Desktop auth buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {utilisateur ? (
                    <Box sx={{display: "flex", gap : 2, alignItems: 'center', flexDirection: 'row'}}>
                    <Typography sx={{color : 'text.muted', textAlign: "center"}}>Bonjour {utilisateur.courriel}</Typography>
                    <Button variant="outlined" onClick={gererDeconnexion} >
                        Déconnexion
                    </Button>
                    </Box>
            ) :(
                <Box sx={{display: "flex", gap: 2}}>
                    <Button component={Link} to={"/connexion"}  variant="outlined" color="primary">
                        Connexion
                    </Button>
                        <Button component={Link} to={"/inscription"} variant="contained" color="primary">
                    Inscription
                    </Button>
                </Box>
          )}

        </Box>

        {/* Mobile hamburger */}
        <IconButton
          edge="end"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { md: 'none' }, color: 'primary.main' }}
          aria-label="Ouvrir le menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>
    </AppBar>
  );
}
