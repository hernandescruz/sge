import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, InputAdornment } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';
import { Solicitante } from '../../types';

export const RequesterPage = () => {
    const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        const res = await api.get<Solicitante[]>('/solicitantes');
        setSolicitantes(res.data);
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await api.post('/solicitantes', { nome: newName.toUpperCase(), ativo: true });
        setNewName('');
        loadData();
    };

    const handleToggleStatus = async (id: number) => {
        if (window.confirm("Alterar status do solicitante?")) {
            await api.patch(`/solicitantes/${id}/inativar`);
            loadData();
        }
    };

    const filtered = solicitantes.filter(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Gestão de Solicitantes</Typography>
            <Paper component="form" onSubmit={handleAdd} sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <TextField label="Nome do Solicitante" fullWidth value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Button type="submit" variant="contained"><AddIcon/></Button>
            </Paper>
            <TextField fullWidth placeholder="Pesquisar..." sx={{ mb: 2 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                       InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell>Nome</TableCell><TableCell align="center">Status</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead>
                    <TableBody>
                        {filtered.map((s) => (
                            <TableRow key={s.id} sx={{ backgroundColor: !s.ativo ? '#fdecea' : 'inherit', opacity: !s.ativo ? 0.7 : 1 }}>
                                <TableCell>{s.nome}</TableCell>
                                <TableCell align="center"><Chip label={s.ativo ? "ATIVO" : "INATIVO"} color={s.ativo ? "success" : "error"} size="small" /></TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleToggleStatus(s.id)} color={s.ativo ? "error" : "success"}>
                                        {s.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};