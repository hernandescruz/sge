import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Stack, TextField, Button
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../../services/api';
import { Movimentacao } from '../../types';
import { exportMovimentacoesToExcel } from '../../services/excelExport';

export const HistoryPage = () => {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

    // Estados para Filtros
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    useEffect(() => {
        const carregarHistorico = async () => {
            try {
                const response = await api.get<Movimentacao[]>('/movimentacoes');
                setMovimentacoes(response.data);
            } catch (error) { console.error(error); }
        };
        carregarHistorico();
    }, []);

    // Lógica de Filtro por Data
    const dadosFiltrados = movimentacoes.filter(m => {
        if (!dataInicio || !dataFim) return true;
        const dataMov = new Date(m.createdAt).toISOString().split('T')[0];
        return dataMov >= dataInicio && dataMov <= dataFim;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} spacing={2}>
                <Typography variant="h4">Histórico de Movimentações</Typography>

                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Início" type="date" size="small" InputLabelProps={{ shrink: true }}
                        value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    />
                    <TextField
                        label="Fim" type="date" size="small" InputLabelProps={{ shrink: true }}
                        value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                    />
                    <Button
                        variant="contained" color="success"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => exportMovimentacoesToExcel(dadosFiltrados)}
                        disabled={dadosFiltrados.length === 0}
                    >
                        Exportar Excel
                    </Button>
                </Stack>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Item</TableCell>
                            <TableCell align="right">Quantidade</TableCell>
                            <TableCell>Solicitante</TableCell>
                            <TableCell>Centro de Custo</TableCell>
                            <TableCell>Finalidade</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dadosFiltrados.map((mov) => (
                            <TableRow key={mov.id} hover>
                                <TableCell>{new Date(mov.createdAt).toLocaleString('pt-BR')}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={mov.tipoMovimento.replace('_', ' ')}
                                        color={mov.tipoMovimento.includes('ENTRADA') ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell><strong>{mov.item.descricao}</strong></TableCell>
                                <TableCell align="right">{mov.quantidade} {mov.item.unidadeMedida}</TableCell>
                                <TableCell>{mov.solicitante.nome}</TableCell>
                                <TableCell>{mov.centroCusto.nome}</TableCell>
                                <TableCell>{mov.finalidade.nome}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};