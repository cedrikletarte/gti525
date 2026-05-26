import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Checkbox,
    FormGroup,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Select,
    MenuItem,
    Paper
} from '@mui/material';
import CircleIcon from "@mui/icons-material/Circle";
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import ExpandLessSharpIcon from '@mui/icons-material/ExpandLessSharp';
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useState, useEffect} from "react";
import csvRaw from '../data/territoires.csv?raw';

function parseCSV(raw) {
    const lines = raw.split(/\r?\n/);
    return lines
        .map(line => {
            return line.split(',')[0];
        })
        .filter(line => {
            return line !== '';
        });
}

const territoires = parseCSV(csvRaw);

function countCircuits(data) {
    if(data != null) {
        return data.length
    }
}

function sumCircuitDistance(data) {

    let totalDistance = 0;
    if(data != null) {
        for (let i = 0; i < data.length; i++) {
            totalDistance += data[i].properties.LONGUEUR;

        }
    }

    return totalDistance;
}





export default function Reseau() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [arrondissment, setArrondissment] = useState('all');

    const handleChange = (event) => {
        setArrondissment(event.target.value);
    };

    const [reseauData, setReseauData] = useState(null);

    useEffect(() => {
        fetch("/data/reseau_cyclable.geojson")
            .then((res) => res.json())
            .then((data) => {
                setReseauData(data.features);
            })
            .catch((err) => console.error(err));
    }, []);





    const filterMenu =
        (

    <FormGroup sx={{width:"100%", marginBottom:"1rem"}}>

        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', width: "100%", textAlign: "left"}}>CATÉGORIES</Typography>

        <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={
                <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircleIcon sx={{ color: "#00dddd", fontSize: 18}} />
                    <Typography>REV</Typography>
                </Grid>
            }
            sx={{width:"100%"}}

        />
        <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={
                <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircleIcon sx={{ color: "#49c553", fontSize: 18}} />
                    <Typography>Voie partagée</Typography>
                </Grid>
            }
            sx={{width:"100%"}}

        />
        <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={
                <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircleIcon sx={{ color: "#004917", fontSize: 18}} />
                    <Typography>Voie protégée</Typography>
                </Grid>
            }
            sx={{width:"100%"}}

        />
        <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={
                <Grid container spacing={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircleIcon sx={{ color: "#bd30bd", fontSize: 18}} />
                    <Typography>Sentier polyvalent</Typography>
                </Grid>
            }
            sx={{width:"100%"}}

        />

        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', marginTop: 4,  width:"100%", textAlign: "left"}}>SAISON</Typography>

        <RadioGroup defaultValue="all"  sx={{width:"100%"}}>
            <FormControlLabel value="all" control={<Radio/>} label="Toutes les pistes"/>
            <FormControlLabel value="4-seasons" control={<Radio/>} label="4 saisons"/>
            <FormControlLabel value="3-seasons" control={<Radio/>} label="3 saisons"/>
        </RadioGroup>

        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', marginTop: 4, marginBottom: 1, width:"100%", textAlign: "left"}}>ARRONDISSEMENT</Typography>

        <FormControl  sx={{width:"100%"}}>
            <Select value={arrondissment} sx={{textAlign: "left"}} onChange={handleChange} variant="outlined">
                <MenuItem value="all">Tous</MenuItem>
                {
                    territoires.map((item) => (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
            </Select>
        </FormControl>

        <Box sx={{backgroundColor: "#8cc5984f", marginTop: 4, padding: 2, borderRadius: 4, width:"100%"}}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#919191', textAlign: "left"}}>PISTES POPULAIRES</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{display: "flex", alignItems : "center", gap: 1}}>
                    <DatePicker label="De" format="DD-MM-YYYY" sx={{backgroundColor: "#ffffff", marginTop : 1, marginBottom : 1,width : "100%"}} slotProps={{ textField: { size: 'small' } }} />
                </Box>
                <Box sx={{display: "flex", alignItems : "center", gap: 1}}>
                    <DatePicker label="À" format="DD-MM-YYYY" sx={{backgroundColor: "#ffffff",marginTop : 1, marginBottom : 1,width : "100%"}} slotProps={{ textField: { size: 'small' } }} />
                </Box>
            </LocalizationProvider>
            <Button variant="contained" size="small" sx={{width:  '100%', justifyContent: "flex-start", marginBottom : 1,  marginTop : 1}}>Mettre en surbrillance</Button>
            <Button variant="outlined" size="small" sx={{width:  '100%', justifyContent: "flex-start", marginBottom : 1, backgroundColor: "#ffffff", borderWidth: 2}}>Réinitialiser</Button>
        </Box>
    </FormGroup>
  );

    const interactiveMap =
        (
        <Box
        sx = {{
            position: "relative",
        }}>
            <MapContainer
                center={[45.5017, -73.5673]} // Montreal
                zoom={10}
                style={{ height: '100vh', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                />
            </MapContainer>
            <Paper
                sx={{
                    position: "absolute",
                    backgroundColor: "#ffffff",
                    zIndex: 1000,
                    bottom : 25,
                    right : 10,
                    display : "flex",
                    justifyContent: "space-between",
                    padding: 1
                }}
            >
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', paddingRight : 0.5}}>{countCircuits(reseauData)}</Typography>
                <Typography sx={{ fontSize: 15, color: '#000000', paddingRight : 0.5}}>pistes affichés, </Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', paddingRight : 0.5}}>{sumCircuitDistance(reseauData)}</Typography>
                <Typography sx={{ fontSize: 15, color: '#000000'}}> km</Typography>
            </Paper>
        </Box>

        );




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
                <Grid size={{ xs: 0, md : 4 }} sx={{textAlign: 'left', display: { xs: 'none', md: 'block' }}}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 3}}>Filtres</Typography>
                    {filterMenu}
                </Grid>

                <Grid size={{ xs: 12, md : 8 }}>
                    <Box sx={{display : {md: "none"} }}>
                        <Box sx={{display : "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 3, textAlign: "left"}}>Filtres</Typography>
                            <Button
                                sx={{p : 0, marginBottom: 3}}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? <ExpandLessSharpIcon/> : <ExpandMoreSharpIcon/>}
                            </Button>
                        </Box>

                        {isExpanded ? filterMenu : null}
                    </Box>
                    {interactiveMap}
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
          backgroundColor: '#f5f5f5'
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
