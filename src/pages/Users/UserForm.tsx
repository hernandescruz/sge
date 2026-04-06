import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Grid, Alert
} from '@mui/material';
import api from '../../services/api';

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const UserForm = ({ open, onClose, onSuccess }: UserFormProps) => {
    const [formData, setFormData] = useState({
        nome: '',
        usuario: '',
        password: '',
        cargo: '',
        perfil: 'OPERADOR'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/usuarios', formData);
            setFormData({ nome: '', usuario: '', password: '', cargo: '', perfil: 'OPERADOR' });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError('Erro ao cadastrar usuário. Verifique se o login já existe.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Novo Usuário do Sistema</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="Nome Completo" fullWidth required
                                       value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Login (Usuário)" fullWidth required
                                       value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Senha" type="password" fullWidth required
                                       value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Cargo" fullWidth required
                                       value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Perfil de Acesso" fullWidth required
                                       value={formData.perfil} onChange={e => setFormData({...formData, perfil: e.target.value})}>
                                <MenuItem value="ADMIN">ADMIN (Tudo)</MenuItem>
                                <MenuItem value="GERENTE">GERENTE (Operação + Histórico)</MenuItem>
                                <MenuItem value="OPERADOR">OPERADOR (Apenas Movimentar)</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">Salvar Usuário</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};