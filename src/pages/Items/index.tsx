import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ItemForm } from './ItemForm';
import { ImportDialog } from './ImportDialog';
import api from '../../services/api';
import { Item } from '../../types';

export const ItemsPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [busca, setBusca] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [openImport, setOpenImport] = useState(false);

    const carregarItens = async (filtro = '') => {
        try {
            const url = filtro ? `/itens/busca?descricao=${filtro}` : '/itens';
            const response = await api.get<Item[]>(url);
            setItems(response.data);
        } catch (error) {
            console.error("Erro ao carregar itens", error);
        }
    };

    const handleToggleStatus = async (id: number) => {
        if (window.confirm("Deseja alterar o status de ativação deste item?")) {
            try {
                await api.patch(`/itens/${id}/inativar`);
                carregarItens(busca);
            } catch (error) {
                alert("Erro ao alterar status do item.");
            }
        }
    };

    useEffect(() => {
        carregarItens();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            carregarItens(busca);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [busca]);

    // Função auxiliar para formatar moeda
    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#2a0017', fontWeight: 'bold' }}>Estoque de Materiais</Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setOpenImport(true)}>
                        Importar Excel
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#2a0017', '&:hover': { bgcolor: '#40001d' } }} startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
                        Novo Item
                    </Button>
                </Stack>
            </Stack>

            <TextField
                fullWidth
                label="Buscar por descrição..."
                variant="outlined"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                sx={{ mb: 3 }}
            />

            <ItemForm open={openForm} onClose={() => setOpenForm(false)} onSuccess={() => carregarItens()} />

            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table size="small"> {/* Usei size small para caber mais colunas confortavelmente */}
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Local</TableCell>
                            <TableCell align="right">Estoque</TableCell>
                            <TableCell align="right">Mínimo</TableCell>

                            {/* NOVAS COLUNAS FINANCEIRAS */}
                            <TableCell align="right">Vlr. Unitário</TableCell>
                            <TableCell align="right">Total Estoque</TableCell>

                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => {
                            // Cálculo do valor total em linha
                            const valorTotal = Number(item.estoqueAtual) * Number(item.precoUnitario);

                            return (
                                <TableRow
                                    key={item.id}
                                    hover
                                    sx={{
                                        backgroundColor: !item.ativo ? '#fdecea' : 'inherit',
                                        opacity: !item.ativo ? 0.7 : 1
                                    }}
                                >
                                    <TableCell>{item.codigoItem}</TableCell>
                                    <TableCell sx={{ fontWeight: item.ativo ? 'bold' : 'normal' }}>
                                        {item.descricao}
                                    </TableCell>
                                    <TableCell>{item.localizacao || '---'}</TableCell>
                                    <TableCell align="right">{item.estoqueAtual} </TableCell>
                                    <TableCell align="right" color="textSecondary">{item.estoqueMinimo}</TableCell>

                                    {/* EXIBIÇÃO DOS VALORES */}
                                    <TableCell align="right">
                                        {formatarMoeda(Number(item.precoUnitario))}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: item.ativo ? '#1b5e20' : 'inherit' }}>
                                        {formatarMoeda(valorTotal)}
                                    </TableCell>

                                    <TableCell align="center">
                                        {!item.ativo ? (
                                            <Chip label="INATIVO" color="error" size="small" variant="outlined" />
                                        ) : (
                                            Number(item.estoqueAtual) < Number(item.estoqueMinimo) ? (
                                                <Chip label="REPOR" color="warning" size="small" />
                                            ) : (
                                                <Chip label="OK" color="success" size="small" />
                                            )
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={() => handleToggleStatus(Number(item.id))}
                                            color={item.ativo ? "error" : "success"}
                                            size="small"
                                        >
                                            {item.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <ImportDialog open={openImport} onClose={() => setOpenImport(false)} onSuccess={() => carregarItens()} />
        </Box>
    );
};