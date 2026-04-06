import  { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setError('');
            await signIn(usuario, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Usuário ou senha inválidos!');
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        SGE - Almoxarifado
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Usuário"
                            autoFocus
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, height: 45 }}
                        >
                            Entrar
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};