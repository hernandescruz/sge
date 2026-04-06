import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, InputAdornment
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';
import { Finalidade } from '../../types';

export const PurposePage = () => {
    const [centers, setCenters] = useState<Finalidade[]>([]);
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        const res = await api.get<Finalidade[]>('/finalidades');
        setCenters(res.data);
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await api.post('/finalidades', { nome: newName.toUpperCase(), ativo: true });
        setNewName('');
        loadData();
    };

    const handleToggleStatus = async (id: number) => {
        const msg = "Deseja alterar o status desta Finalidade?";
        if (window.confirm(msg)) {
            // Chamamos o endpoint de inativação que você configurou
            await api.patch(`/finalidades/${id}/inativar`);
            loadData();
        }
    };

    // Lógica de Filtro local (rápida)
    const filteredCenters = centers.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Finalidades</Typography>

            {/* Cadastro Rápido */}
            <Paper component="form" onSubmit={handleAdd} sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="Nova Finalidades"
                    fullWidth
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Button type="submit" variant="contained"><AddIcon/></Button>
            </Paper>

            {/* Barra de Busca */}
            <TextField
                fullWidth
                placeholder="Pesquisar Finalidades..."
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Nome da Finalidade</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCenters.map((c) => (
                            <TableRow
                                key={c.id}
                                sx={{
                                    backgroundColor: !c.ativo ? '#fdecea' : 'inherit',
                                    opacity: !c.ativo ? 0.7 : 1
                                }}
                            >
                                <TableCell sx={{ fontWeight: c.ativo ? 'bold' : 'normal' }}>
                                    {c.nome}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={c.ativo ? "ATIVO" : "INATIVO"}
                                        color={c.ativo ? "success" : "error"}
                                        size="small"
                                        variant={c.ativo ? "filled" : "outlined"}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        onClick={() => handleToggleStatus(c.id)}
                                        color={c.ativo ? "error" : "success"}
                                        title={c.ativo ? "Inativar" : "Reativar"}
                                    >
                                        {c.ativo ? <BlockIcon /> : <CheckCircleIcon />}
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