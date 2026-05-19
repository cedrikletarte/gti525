import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Grid,
  Paper,
  Checkbox,
  FormGroup,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem
} from '@mui/material';
import CircleIcon from "@mui/icons-material/Circle";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import Navbar from '../components/Navbar';




export default function Reseau() {
  
  return (
    <>
      <header>
        <Navbar activePage="Réseau" />
      </header>

      <main>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 0.1 } }}>
        
        <Box component="section" sx={{ py: { xs: 4, md: 3 }, backgroundColor: '#ffffff' }}>
          <Container maxWidth="lg">
            <Grid container spacing={2}>
                <Grid size={3} sx={{textAlign: 'left'}}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 3}}>Filtres</Typography>
                    <FormGroup>

                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191'}}>CATÉGORIES</Typography>
                      
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={
                           <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <CircleIcon sx={{ color: "#00dddd", fontSize: 18}} />
                            <Typography>REV</Typography>
                          </Grid>
                        }
                        
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={
                           <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <CircleIcon sx={{ color: "#49c553", fontSize: 18}} />
                            <Typography>Voie partagée</Typography>
                          </Grid>
                        }
                        
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={
                           <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <CircleIcon sx={{ color: "#004917", fontSize: 18}} />
                            <Typography>Voie protégée</Typography>
                          </Grid>
                        }
                        
                      />
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={
                           <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <CircleIcon sx={{ color: "#bd30bd", fontSize: 18}} />
                            <Typography>Sentier polyvalent</Typography>
                          </Grid>
                        }
                        
                      />

                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', marginTop: 4}}>SAISON</Typography>
                      
                      <RadioGroup defaultValue="all">
                          <FormControlLabel value="all" control={<Radio/>} label="Toutes les pistes"/>
                          <FormControlLabel value="4-seasons" control={<Radio/>} label="4 saisons"/>
                          <FormControlLabel value="3-seasons" control={<Radio/>} label="3 saisons"/>
                      </RadioGroup>

                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', marginTop: 4, marginBottom: 1}}>ARRONDISSEMENT</Typography>
                      
                      <FormControl>
                        <Select value="all">
                          <MenuItem value="all">Tous</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Box sx={{backgroundColor: "#8cc5984f", marginTop: 4, padding: 2, borderRadius: 4}}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191'}}>PISTES POPULAIRES</Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <Box sx={{display: "flex", alignItems : "center", gap: 1, maxWidth: 350}}>
                            <DatePicker sx={{backgroundColor: "#ffffff", marginTop : 0.5}}/>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191'}}>à</Typography>
                            <DatePicker sx={{backgroundColor: "#ffffff", marginTop : 0.5}}/>
                          </Box>

                        </LocalizationProvider>
                        <Button variant="contained" size="small" sx={{width:  '100%', justifyContent: "flex-start", marginBottom : 1,  marginTop : 1}}>Mettre en surbrillance</Button>
                        <Button variant="outlined" size="small" sx={{width:  '100%', justifyContent: "flex-start", marginBottom : 1, backgroundColor: "#ffffff", borderWidth: 2}}>Réinitialiser</Button>
                      </Box>
                      

                    </FormGroup>
                </Grid>
                <Grid size={9}>

                </Grid>
            </Grid>
          </Container>
        </Box>
        </Container>
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
