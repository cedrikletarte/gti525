import { useState } from 'react';
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
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const NAV_LINKS = [
  'Accueil',
  'Réseau',
  'Statistiques',
  "Points d'intérêt",
  'Assistant',
  'À propos',
];

export default function Navbar({ activePage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linkSx = (label) => ({
    color: activePage === label ? 'primary.main' : 'grey.500',
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
        {NAV_LINKS.map((label) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
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
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button variant="outlined" color="primary" fullWidth>
          Connexion
        </Button>
        <Button variant="contained" color="primary" fullWidth>
          Inscription
        </Button>
      </Box>
    </Box>
  );

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 700, color: 'primary.main', flexGrow: { xs: 1, md: 0 }, mr: { md: 4 } }}
        >
          🚲 MTL Vélo
        </Typography>

        {/* Desktop nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          {NAV_LINKS.map((label) => (
            <Button key={label} sx={linkSx(label)}>
              {label}
            </Button>
          ))}
        </Box>

        {/* Desktop auth buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button variant="outlined" color="primary">
            Connexion
          </Button>
          <Button variant="contained" color="primary">
            Inscription
          </Button>
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
