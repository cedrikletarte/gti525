import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '../components/Navbar';

const MAX_LENGTH = 1000;

// Suggestions affichées tant que la conversation est vide.
const SUGGESTIONS = [
  "Points d'eau à proximité",
  'Statistiques du réseau',
];

// Réponses simulées (maquette). À remplacer plus tard par un appel à l'API.
function mockReply(question) {
  const q = question.toLowerCase();
  if (q.includes('fontaine') || q.includes('eau')) {
    return "D'après les données ouvertes de la Ville de Montréal, la fontaine la plus proche se trouve dans l'arrondissement du Plateau-Mont-Royal, au parc La Fontaine.";
  }
  if (q.includes('statistique') || q.includes('passage') || q.includes('compteur')) {
    return 'Le réseau compte 64 compteurs vélo. Le compteur le plus fréquenté enregistre en moyenne plus de 5 000 passages par jour en période estivale.';
  }
  if (q.includes('piste') || q.includes('réseau') || q.includes('reseau')) {
    return 'Le réseau cyclable de Montréal totalise 970,4 km répartis sur 8 088 segments, incluant le REV, des voies protégées, des voies partagées et des sentiers polyvalents.';
  }
  return "Merci pour votre question ! Ceci est une réponse simulée : l'assistant sera bientôt connecté aux données réelles du réseau cyclable de Montréal.";
}

let nextId = 1;

export default function Assistant() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Fait défiler la zone de conversation vers le dernier message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId++, sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    // Réponse simulée avec un léger délai pour imiter un temps de traitement.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId++, sender: 'bot', text: mockReply(text) },
      ]);
      setIsTyping(false);
    }, 700);
  }

  function handleSubmit() {
    sendMessage(inputText);
  }

  function handleKeyDown(e) {
    // Entrée envoie, Maj+Entrée insère un saut de ligne.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.50' }}>
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
          <Box
            ref={scrollRef}
            sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            {/* Header / Suggestions — affiché tant que la conversation est vide */}
            {isEmpty && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>
                  Bonjour, comment puis-je vous aider ?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 3 }}>
                  {SUGGESTIONS.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      clickable
                      onClick={() => sendMessage(label)}
                      sx={{ bgcolor: 'rgba(45,106,79,0.1)', color: 'primary.main', fontWeight: '500', p: 1 }}
                    />
                  ))}
                </Box>
                <Divider sx={{ mt: 4 }} />
              </Box>
            )}

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
                    color: msg.sender === 'user' ? 'text.secondary' : 'white',
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
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
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
                          bgcolor: 'rgba(45,106,79,0.05)',
                        },
                      }}
                    >
                      {msg.actionLabel}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}

            {/* Indicateur « en train d'écrire » */}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <SmartToyIcon />
                </Avatar>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderTopLeftRadius: 0,
                    bgcolor: '#f4f6f8',
                    color: 'text.secondary',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    L'assistant écrit…
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Formulaire de saisie - Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                placeholder="Posez votre question sur MTL Vélo..."
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, MAX_LENGTH))}
                onKeyDown={handleKeyDown}
                inputProps={{ maxLength: MAX_LENGTH }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    bgcolor: '#f4f6f8',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!inputText.trim() || isTyping}
                endIcon={<SendIcon />}
                sx={{ height: 56, borderRadius: 4, px: 3, flexShrink: 0 }}
              >
                Envoyer
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Les messages sont générés par l'IA et sont des suggestions basées sur les données disponibles.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {inputText.length}/{MAX_LENGTH}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
