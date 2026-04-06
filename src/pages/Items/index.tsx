import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BlockIcon from '@mui/icons-material/Block'; // Ícone para inativar
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Ícone para reativar

import { ItemForm } from './ItemForm';
import { ImportDialog } from './ImportDialog';
import api from '../../services/api';
import { Item } from '../../types';

export const ItemsPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [busca, setBusca] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [openImport, setOpenImport] = useState(false);

    // Função para carregar itens
    const carregarItens = async (filtro = '') => {
        try {
            const url = filtro ? `/itens/busca?descricao=${filtro}` : '/itens';
            const response = await api.get<Item[]>(url);
            setItems(response.data);
        } catch (error) {
            console.error("Erro ao carregar itens", error);
        }
    };

    // Função para Inativar/Reativar (Delete Lógico)
    const handleToggleStatus = async (id: number) => {
        if (window.confirm("Deseja alterar o status de ativação deste item?")) {
            try {
                await api.patch(`/itens/${id}/inativar`);
                carregarItens(busca); // Recarrega com o filtro atual
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

    return (
        <Box>
            {/* Cabeçalho com Título e Botões */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4">Estoque de Materiais</Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<FileUploadIcon />}
                        onClick={() => setOpenImport(true)}
                    >
                        Importar Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenForm(true)}
                    >
                        Novo Item
                    </Button>
                </Stack>
            </Stack>

            {/* Campo de Busca */}
            <TextField
                fullWidth
                label="Buscar por descrição..."
                variant="outlined"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                sx={{ mb: 3 }}
            />

            <ItemForm open={openForm} onClose={() => setOpenForm(false)} onSuccess={() => carregarItens()} />

            {/* Tabela de Dados */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Localização</TableCell>
                            <TableCell align="right">Estoque Atual</TableCell>
                            <TableCell align="right">Mínimo</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    backgroundColor: !item.ativo ? '#fdecea' : 'inherit', // Vermelho claro se inativo
                                    opacity: !item.ativo ? 0.7 : 1 // Transparência se inativo
                                }}
                            >
                                <TableCell>{item.codigoItem}</TableCell>
                                <TableCell sx={{ fontWeight: item.ativo ? 'bold' : 'normal' }}>
                                    {item.descricao}
                                </TableCell>
                                <TableCell>{item.localizacao || '---'}</TableCell>
                                <TableCell align="right">{item.estoqueAtual}</TableCell>
                                <TableCell align="right">{item.estoqueMinimo}</TableCell>
                                <TableCell align="center">
                                    {!item.ativo ? (
                                        <Chip label="INATIVO" color="error" size="small" variant="outlined" />
                                    ) : (
                                        item.estoqueAtual < item.estoqueMinimo ? (
                                            <Chip label="ABAIXO DO MÍNIMO" color="warning" size="small" />
                                        ) : (
                                            <Chip label="DISPONÍVEL" color="success" size="small" />
                                        )
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        onClick={() => handleToggleStatus(Number(item.id))}
                                        color={item.ativo ? "error" : "success"}
                                        title={item.ativo ? "Inativar Item" : "Ativar Item"}
                                    >
                                        {item.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ImportDialog open={openImport} onClose={() => setOpenImport(false)} onSuccess={() => carregarItens()} />
        </Box>
    );
};