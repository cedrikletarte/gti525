import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';

export default function Connexion() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <header>
                <Navbar activePage="Connexion" />
            </header>

            <main>
               <LoginForm/>
            </main>
        </Box>
    );
}
