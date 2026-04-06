import { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'; // Importes do Recharts

import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../services/api';
import { Item, Movimentacao } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const DashboardPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [itemsAbaixoMinimo, setItemsAbaixoMinimo] = useState<Item[]>([]);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [resItems, resMovs, resAlerts] = await Promise.all([
                    api.get<Item[]>('/itens'),
                    api.get<Movimentacao[]>('/movimentacoes'),
                    api.get<Item[]>('/itens/busca?abaixoMinimo=true')
                ]);
                setItems(resItems.data);
                setMovimentacoes(resMovs.data);
                setItemsAbaixoMinimo(resAlerts.data);
            } catch (error) { console.error(error); }
        };
        carregarDados();
    }, []);

    // 1. CÁLCULO FINANCEIRO
    const valorTotalEstoque = items.reduce((acc, i) => acc + (Number(i.estoqueAtual) * Number(i.precoUnitario)), 0);

    // 2. LÓGICA: TOP 5 ITENS MAIS CONSUMIDOS (SAÍDAS)
    const topConsumedData = movimentacoes
        .filter(m => m.tipoMovimento === 'SAIDA')
        .reduce((acc: any[], curr) => {
            const index = acc.findIndex(a => a.name === curr.item.descricao);
            if (index > -1) {
                acc[index].quantidade += Number(curr.quantidade);
            } else {
                acc.push({ name: curr.item.descricao, quantidade: Number(curr.quantidade) });
            }
            return acc;
        }, [])
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5); // Pega apenas os 5 primeiros

    // 3. LÓGICA: DISTRIBUIÇÃO POR UNIDADE DE MEDIDA (PIE CHART)
    const pieData = items.reduce((acc: any[], curr) => {
        const index = acc.findIndex(a => a.name === curr.unidadeMedida);
        if (index > -1) {
            acc[index].value += 1;
        } else {
            acc.push({ name: curr.unidadeMedida, value: 1 });
        }
        return acc;
    }, []);

    return (
        <Box sx={{ pb: 5 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Painel de Indicadores</Typography>

            {/* CARDS SUPERIORES (RESUMO) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Itens Totais</Typography>
                                    <Typography variant="h4">{items.length}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <AttachMoneyIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Patrimônio</Typography>
                                    <Typography variant="h4">{valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: itemsAbaixoMinimo.length > 0 ? '#d32f2f' : '#ed6c02', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <WarningIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Críticos</Typography>
                                    <Typography variant="h4">{itemsAbaixoMinimo.length}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* GRÁFICOS AVANÇADOS */}
            <Grid container spacing={4}>
                {/* Gráfico de Barras: Top Consumo */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Top 5 Itens Mais Consumidos (Qtd)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={topConsumedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="quantidade" fill="#1b5e20" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Pizza: Tipos de Material */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Estoque por Unidade</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};