import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

const TYPE_FIELDS = {
  Fontaine: [
    "intersection",
  ],
};


export default function PointInteretForm({
  form,
  onChange,
  arrondissements,
}) {

  const specificFields = TYPE_FIELDS[form.type] || [];

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 , display: "flex" , flexDirection: "column" }}>

      {/* Type */}
      <Grid xs={12} md={12}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>

          <Select
            label="Type"
            value={form.type}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <MenuItem value="Fontaine">
              Fontaine
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Arrondissement */}
      <Grid xs={12} md={12}>
        <FormControl fullWidth>
          <InputLabel>Arrondissement</InputLabel>

          <Select
            label="Arrondissement"
            value={form.arrondissement}
            onChange={(e) =>
              onChange("arrondissement", e.target.value)
            }
          >
            {arrondissements.map((arr) => (
              <MenuItem key={arr} value={arr}>
                {arr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Nom */}
      <Grid xs={12} md={12}>
        <TextField
          fullWidth
          required
          label="Nom"
          value={form.nom_parc_lieu}
          onChange={(e) =>
            onChange("nom_parc_lieu", e.target.value)
          }
        />
      </Grid>

      {/* Latitude */}
      <Grid xs={12} md={12}>
        <TextField
          fullWidth
          required
          type="number"
          label="Latitude"
          value={form.latitude}
          onChange={(e) =>
            onChange("latitude", e.target.value)
          }
        />
      </Grid>

      {/* Longitude */}
      <Grid xs={12} md={12}>
        <TextField
          fullWidth
          required
          type="number"
          label="Longitude"
          value={form.longitude}
          onChange={(e) =>
            onChange("longitude", e.target.value)
          }
        />
      </Grid>

      {/* Champs spécifiques Fontaine */}
      {specificFields.includes("intersection") && (
        <Grid xs={12} md={12}>
          <TextField
            fullWidth
            label="Intersection"
            value={form.intersection}
            onChange={(e) =>
              onChange("intersection", e.target.value)
            }
          />
        </Grid>
      )}


    </Grid>
  );
}

