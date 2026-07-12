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

// Interroge la route serveur POST /gti525/v1/assistant. La clé d'API du LLM
// reste côté serveur : la frontale ne fait qu'envoyer la question.
async function fetchReply(question) {
  const res = await fetch('/gti525/v1/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erreur || "L'assistant est momentanément indisponible.");
  }
  return data.reponse;
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

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId++, sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    try {
      const reponse = await fetchReply(text);
      setMessages((prev) => [...prev, { id: nextId++, sender: 'bot', text: reponse }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId++, sender: 'bot', text: `⚠️ ${err.message}`, isError: true },
      ]);
    } finally {
      setIsTyping(false);
    }
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
