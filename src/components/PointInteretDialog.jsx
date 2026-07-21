import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from "@mui/material";
import {
    creerPointInteret,
    modifierPointInteret,
} from "../api/authClient.js";

import PointInteretForm from "./PointInteretForm.jsx";

const defaultValues = {
    type: "Fontaine",
    nom_parc_lieu:"",
    arrondissement: "",
    intersection: "",
    latitude: "",
    longitude: "",
};

export default function PointInteretDialog({
                                               open,
                                               mode = "create",
                                               point = null,
                                               arrondissements = [],
                                               onClose,
                                               onSaved,
                                           }) {
    const [form, setForm] = useState(defaultValues);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && point) {
            setForm({
                type: point.Type ?? "",
                arrondissement: point.Arrondissement ?? "",
                nom_parc_lieu: point.Nom_parc_lieu ?? point.Nom ?? "",
                intersection: point.Intersection ?? point.Adresse ?? "",
                latitude: point.Latitude ?? "",
                longitude: point.Longitude ?? ""
            });
        } else {
            setForm(defaultValues);
        }
    }, [open, mode, point]);

    function updateField(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    async function handleSave() {
        if (!form.nom_parc_lieu.trim()) {
            alert("Le nom est obligatoire.");
            return;
        }

        if (form.latitude === "" || form.longitude === "") {
            alert("La latitude et la longitude sont obligatoires.");
            return;
        }

        setSaving(true);

        const payload = {
            ...form,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
        };

        try {
            let response;

            if (mode === "create") {
                response = await creerPointInteret(payload);
            } else {
                console.log(point)
                response = await modifierPointInteret(
                    point.id,
                    payload
                );
            }

            if (!response.ok) {
                throw new Error(
                    response.donnees?.erreur || response.erreur || "Erreur."
                );
            }

            onSaved?.();
            onClose();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                {mode === "create"
                    ? "Ajouter un point d'intérêt"
                    : "Modifier le point d'intérêt"}
            </DialogTitle>

            <DialogContent dividers>
                <PointInteretForm
                    form={form}
                    onChange={updateField}
                    arrondissements={arrondissements}
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Annuler
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : mode === "create" ? (
                        "Ajouter"
                    ) : (
                        "Enregistrer"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}