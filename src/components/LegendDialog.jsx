import {
  Box, Dialog, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';


export default function LegendDialog({ open, onClose, categories }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6, color: '#000000' }}>
        Légende des catégories
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {categories.map(cat => (
          <Box key={cat.key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <CircleIcon sx={{ color: cat.color, mt: 0.3, flexShrink: 0 }} />
            <Box>
              <Typography fontWeight={700}>{cat.label}</Typography>
              <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}