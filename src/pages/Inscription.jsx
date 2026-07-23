import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import RegisterForm from '../components/RegisterForm';

export default function Inscription() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <header>
                <Navbar activePage="Inscription" />
            </header>

            <main>
                <RegisterForm/>
            </main>
        </Box>
    );
}
