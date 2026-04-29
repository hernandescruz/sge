import { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, TooltipProps
} from 'recharts';

import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../services/api';
import { Item, Movimentacao } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8884d8', '#d0ed57', '#a4de6c'];

// Componente para formatar valores monetários no Tooltip do gráfico
const CustomTooltipCurrency = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 1.5, border: '1px solid #ddd', boxShadow: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {payload[0].payload.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    {`Valor: ${payload[0].value?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    })}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

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

    // 1. CÁLCULO PATRIMÔNIO TOTAL
    const valorTotalEstoque = items.reduce((acc, i) => acc + (Number(i.estoqueAtual) * Number(i.precoUnitario)), 0);

    // 2. LÓGICA: TOP 5 ITENS MAIS CONSUMIDOS (QTD)
    const topConsumedData = movimentacoes
        .filter(m => m.tipoMovimento === 'SAIDA')
        .reduce((acc: any[], curr) => {
            const index = acc.findIndex(a => a.name === curr.item.descricao);
            if (index > -1) acc[index].quantidade += Number(curr.quantidade);
            else acc.push({ name: curr.item.descricao, quantidade: Number(curr.quantidade) });
            return acc;
        }, [])
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

    // 3. LÓGICA: CENTROS DE CUSTO MAIS ATIVOS (FREQÜÊNCIA DE SAÍDAS)
    const costCenterData = movimentacoes
        .filter(m => m.tipoMovimento === 'SAIDA' && m.centroCusto.nome.toUpperCase() !== 'ALMOXARIFADO')
        .reduce((acc: any[], curr) => {
            const index = acc.findIndex(a => a.name === curr.centroCusto.nome);
            if (index > -1) acc[index].value += 1;
            else acc.push({ name: curr.centroCusto.nome, value: 1 });
            return acc;
        }, [])
        .sort((a, b) => b.value - a.value);

    // 4. LÓGICA: TOP 10 FINALIDADES POR VALOR (R$)
    const purposeValueData = movimentacoes
        .filter(m => m.tipoMovimento === 'SAIDA' && m.finalidade.nome.toUpperCase() !== 'INVENTÁRIO')
        .reduce((acc: any[], curr) => {
            const index = acc.findIndex(a => a.name === curr.finalidade.nome);
            const valor = Number(curr.valorTotalMovimentacao) || 0;
            if (index > -1) acc[index].total += valor;
            else acc.push({ name: curr.finalidade.nome, total: valor });
            return acc;
        }, [])
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    return (
        <Box sx={{ pb: 5 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2a0017' }}>
                Painel de Indicadores
            </Typography>

            {/* CARDS DE RESUMO */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <InventoryIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Itens em Estoque</Typography>
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
                                    <Typography variant="h6">Patrimônio Total</Typography>
                                    <Typography variant="h4">
                                        {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Typography>
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
                                    <Typography variant="h6">Itens Críticos</Typography>
                                    <Typography variant="h4">{itemsAbaixoMinimo.length}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* 1. GRÁFICO: TOP 5 ITENS MAIS CONSUMIDOS */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Materiais Mais Retirados (Qtd)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={topConsumedData} layout="vertical" margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="quantidade" fill="#2a0017" radius={[0, 5, 5, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* 2. GRÁFICO: CENTROS DE CUSTO (REQUISIÇÕES) */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Uso por Centro de Custo (Saídas)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={costCenterData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={(entry) => entry.name}
                                >
                                    {costCenterData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* 3. NOVO INDICADOR: TOP 10 FINALIDADES POR VALOR FINANCEIRO */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, height: 450 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Investimento por Finalidade / Destino (R$)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={purposeValueData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} fontSize={12} />
                                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                                <Tooltip content={<CustomTooltipCurrency />} />
                                <Bar dataKey="total" name="Valor Gasto" fill="#2e7d32" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};