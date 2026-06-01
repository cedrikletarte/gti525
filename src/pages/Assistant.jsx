import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '../components/Navbar';

export default function Assistant() {
  const [inputText, setInputText] = useState('');

  // Dummy de messages pour la maquette visuelle
  const messages = [
    {
      id: 1,
      sender: 'user',
      text: 'Où est la fontaine la plus proche?',
    },
    {
      id: 2,
      sender: 'bot',
      text: "D'après les données ouvertes de la Ville de Montréal, la fontaine la plus proche de votre position se trouve dans l'arrondissement du Plateau-Mont-Royal, au parc La Fontaine.",
      actionLabel: 'Voir sur la carte',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f4f6f8' }}>
      {/* Header Navigation */}
      <Navbar activePage="Assistant" />

      {/* Main Content Layout */}
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          mt: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflow: 'hidden', // Empêche le défilement global de la page si le contenu déborde
        }}
      >
        {/* Zone Principale - Chat Area */}
        <Paper
          elevation={1}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Messages de la conversation */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Header / Suggestions de la conversation */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>
                Bonjour, comment puis-je vous aider ?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                <Chip 
                  label="Points d'eau à proximité" 
                  clickable 
                  sx={{ bgcolor: 'rgba(45,106,79,0.1)', color: 'primary.main', fontWeight: '500', p: 1 }} 
                />
                <Chip 
                  label="Statistiques du réseau" 
                  clickable 
                  sx={{ bgcolor: 'rgba(45,106,79,0.1)', color: 'primary.main', fontWeight: '500', p: 1 }} 
                />
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Bulles de Chat */}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: msg.sender === 'user' ? '#e0e0e0' : 'primary.main', 
                    color: msg.sender === 'user' ? 'text.secondary' : 'white' 
                  }}
                >
                  {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                
                <Box
                  sx={{
                    maxWidth: { xs: '85%', md: '70%' },
                    p: 2,
                    borderRadius: 2,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : '#f4f6f8',
                    color: msg.sender === 'user' ? 'white' : 'text.primary',
                    borderTopRightRadius: msg.sender === 'user' ? 0 : 16,
                    borderTopLeftRadius: msg.sender === 'bot' ? 0 : 16,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                  {msg.actionLabel && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ 
                        mt: 2, 
                        display: 'block',
                        textTransform: 'none', 
                        bgcolor: 'white',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'rgba(45,106,79,0.05)'
                        }
                      }}
                    >
                      {msg.actionLabel}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Formulaire de saisie - Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: 'white' }}>
            <TextField
              fullWidth
              placeholder="Posez votre question sur MTL Vélo..."
              variant="outlined"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  bgcolor: '#f4f6f8',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  }
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      color="primary" 
                      onClick={() => setInputText('')}
                      disabled={!inputText.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}