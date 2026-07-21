import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import {supprimerPointInteret} from "../api/authClient.js";

export default function PointInteretDeleteDialog({
  open,
  point,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!point) return;

    setLoading(true);

    try {
      let response;
      console.log(point)
      response = await supprimerPointInteret(point.id,);


      if (!response.ok) {
        throw new Error(response.erreur || "Erreur.");
      }

      onDeleted?.();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Supprimer le point d'intérêt
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Êtes-vous certain de vouloir supprimer ce point d'intérêt&nbsp;?
        </DialogContentText>

        <DialogContentText
          sx={{
            mt: 2,
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          {point?.Nom_parc_lieu ?? point?.Nom}
        </DialogContentText>

        <DialogContentText sx={{ mt: 1 }}>
          Cette action est irréversible.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress
              size={20}
              color="inherit"
            />
          ) : (
            "Supprimer"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

