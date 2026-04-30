import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Pagination, Skeleton, ToggleButton, ToggleButtonGroup,
    Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, FileUpload as FileUploadIcon,
    Block as BlockIcon, CheckCircle as CheckCircleIcon,
    FilterList as FilterListIcon } from '@mui/icons-material';

import { ItemForm } from './ItemForm';
import { ImportDialog } from './ImportDialog';
import api from '../../services/api';
import { Item } from '../../types';
import {useAuth} from "@/contexts/AuthContext";

export const ItemsPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');

    // Estados de Paginação e Filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filtroStatus, setFiltroStatus] = useState<string | null>(null); // 'REPOR', 'OK'
    const [filtroAtivo, setFiltroAtivo] = useState<string>('true'); // 'true', 'false', 'all'

    const [openForm, setOpenForm] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const handleToggleStatus = async (id: number) => {
        if (window.confirm("Deseja alterar o status de ativação deste item?")) {
            try {
                await api.patch(`/itens/${id}/inativar`);
                // Após inativar, recarregamos a lista mantendo os filtros
                carregarItens();
            } catch (error) {
                console.error("Erro ao mudar status", error);
                alert("Erro ao alterar status do item.");
            }
        }
    };

    const carregarItens = async () => {
        setLoading(true);
        try {
            // Montamos a URL com todos os filtros para o Backend
            const params = new URLSearchParams({
                page: (page - 1).toString(),
                size: '100',
                descricao: busca,
            });

            if (filtroStatus) params.append('status', filtroStatus);
            if (filtroAtivo !== 'all') params.append('ativo', filtroAtivo);

            const response = await api.get(`/itens?${params.toString()}`);

            // O Spring Page retorna os dados dentro de .content
            setItems(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Erro ao carregar itens", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarItens(); }, [page, filtroStatus, filtroAtivo]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1); // Volta para a página 1 ao pesquisar
            carregarItens();
        }, 500);
        return () => clearTimeout(delay);
    }, [busca]);

    const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Box sx={{ pb: 5 }}>
            {/* CABEÇALHO */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} spacing={2}>
                <Typography variant="h4" sx={{ color: '#2a0017', fontWeight: 'bold' }}>Estoque de Materiais</Typography>

                {/* SEGURANÇA: Somente ADMIN e GERENTE podem ver botões de criação/importação */}
                {(user?.perfil === 'ADMIN' || user?.perfil === 'GERENTE') && (
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => setOpenImport(true)}>
                            Importar
                        </Button>
                        <Button variant="contained" sx={{ bgcolor: '#2a0017' }} startIcon={<AddIcon />} onClick={() => { setEditingItem(null); setOpenForm(true); }}>
                            Novo Item
                        </Button>
                    </Stack>
                )}
            </Stack>

            {/* BARRA DE FILTROS (Visível para todos) */}
            <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Buscar descrição..." variant="outlined" size="small" value={busca} onChange={(e) => setBusca(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">Status:</Typography>
                            <ToggleButtonGroup size="small" value={filtroStatus} exclusive onChange={(_, v) => setFiltroStatus(v)}>
                                <ToggleButton value="REPOR" sx={{ color: 'orange' }}>REPOR</ToggleButton>
                                <ToggleButton value="OK" sx={{ color: 'green' }}>OK</ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">Exibir:</Typography>
                            <ToggleButtonGroup size="small" value={filtroAtivo} exclusive onChange={(_, v) => v && setFiltroAtivo(v)}>
                                <ToggleButton value="true">ATIVOS</ToggleButton>
                                <ToggleButton value="false">INATIVOS</ToggleButton>
                                <ToggleButton value="all">TODOS</ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="right">Estoque</TableCell>
                            <TableCell align="right">Vlr. Unitário</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center">Status</TableCell>

                            {/* SEGURANÇA: Esconde o cabeçalho da coluna Ações para Operadores */}
                            {(user?.perfil === 'ADMIN' || user?.perfil === 'GERENTE') && (
                                <TableCell align="center">Ações</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from(new Array(10)).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell colSpan={7}><Skeleton animation="wave" height={40} /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} hover sx={{ backgroundColor: !item.ativo ? '#fdecea' : 'inherit', opacity: !item.ativo ? 0.7 : 1 }}>
                                    <TableCell>{item.codigoItem}</TableCell>
                                    <TableCell sx={{ fontWeight: item.ativo ? 'bold' : 'normal' }}>{item.descricao}</TableCell>
                                    <TableCell align="right">{item.estoqueAtual} {item.unidadeMedida}</TableCell>
                                    <TableCell align="right">{formatarMoeda(Number(item.precoUnitario))}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {formatarMoeda(Number(item.estoqueAtual) * Number(item.precoUnitario))}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={item.ativo ? (Number(item.estoqueAtual) < Number(item.estoqueMinimo) ? "REPOR" : "OK") : "INATIVO"}
                                              color={item.ativo ? (Number(item.estoqueAtual) < Number(item.estoqueMinimo) ? "warning" : "success") : "error"} size="small" />
                                    </TableCell>

                                    {/* SEGURANÇA: Esconde os botões de ação para Operadores */}
                                    {(user?.perfil === 'ADMIN' || user?.perfil === 'GERENTE') && (
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton onClick={() => { setEditingItem(item); setOpenForm(true); }} color="primary" size="small" title="Editar">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleToggleStatus(Number(item.id))} color={item.ativo ? "error" : "success"} size="small">
                                                    {item.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
            </Box>

            <ItemForm open={openForm} onClose={() => setOpenForm(false)} onSuccess={carregarItens} itemParaEditar={editingItem} />
            <ImportDialog open={openImport} onClose={() => setOpenImport(false)} onSuccess={carregarItens} />
        </Box>
    );
};