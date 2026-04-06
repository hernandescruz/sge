import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Paper,
    Autocomplete, Alert, Divider, Stack, Card, CardContent, CircularProgress
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {CentroCusto, Finalidade, Item, MovimentacaoRequestDTO, Solicitante} from '../../types';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';

export const InventoryPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [physicalQty, setPhysicalQty] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        text: '',
        type: 'success' as 'success' | 'error' | 'info' | 'warning'
    });

    // 1. Carrega apenas itens ativos
    const carregarItens = async () => {
        const res = await api.get<Item[]>('/itens');
        setItems(res.data.filter(i => i.ativo));
    };

    useEffect(() => { carregarItens(); }, []);

    const handleProcessAudit = async () => {
        if (!selectedItem || physicalQty === '' || !user) return;

        setLoading(true);
        const sistema = Number(selectedItem.estoqueAtual);
        const fisica = Number(physicalQty);
        const diferenca = fisica - sistema;

        if (diferenca === 0) {
            setMessage({ text: 'Estoque físico coincide com o sistema. Nada a ajustar.', type: 'info' });
            setLoading(false);
            return;
        }

        // Lógica: Se contou MAIS do que tem no sistema, é ENTRADA_AJUSTE.
        // Se contou MENOS, é SAIDA_AJUSTE.
        const payload: MovimentacaoRequestDTO = {
            tipoMovimento: (diferenca > 0 ? 'ENTRADA_AJUSTE' : 'SAIDA_AJUSTE') as any,
            itemId: Number(selectedItem.id),
            quantidade: Math.abs(diferenca), // Valor sempre positivo
            usuarioId: user.id,
            // Enviamos 0 pois o seu Backend (MovimentacaoService)
            // vai ignorar esses IDs e usar os fixos de "INVENTÁRIO"
            centroCustoId: 0,
            finalidadeId: 0,
            solicitanteId: 0
        };

        try {
            await api.post('/movimentacoes', payload);
            setMessage({
                text: `Sucesso! Ajuste de ${Math.abs(diferenca)} realizado. Novo saldo: ${fisica}`,
                type: 'success'
            });
            setSelectedItem(null);
            setPhysicalQty('');
            carregarItens(); // Atualiza a lista
        } catch (error: any) {
            setMessage({ text: error.response?.data || 'Erro no ajuste.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (isScanning) return <BarcodeScanner onScanSuccess={(code) => {
        const item = items.find(i => String(i.codigoItem) === code);
        if(item) setSelectedItem(item);
        setIsScanning(false);
    }} onClose={() => setIsScanning(false)} />;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Auditoria de Inventário</Typography>

            <Paper sx={{ p: 4 }}>
                {message.text && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

                <Grid container spacing={3}>
                    {/* Passo 1: Qual o item? */}
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1}>
                            <Autocomplete<Item>
                                fullWidth
                                options={items}
                                getOptionLabel={(o) => `${o.codigoItem} - ${o.descricao}`}
                                value={selectedItem}
                                onChange={(_, v) => setSelectedItem(v)}
                                renderInput={(params: any) => <TextField {...params} label="Item para Auditoria" />}
                            />
                            <Button variant="contained" onClick={() => setIsScanning(true)}><QrCodeScannerIcon /></Button>
                        </Stack>
                    </Grid>

                    {selectedItem && (
                        <>
                            {/* Informativo de Estoque Atual */}
                            <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="textSecondary">SALDO ATUAL NO SISTEMA</Typography>
                                    <Typography variant="h4" color="primary">{selectedItem.estoqueAtual} {selectedItem.unidadeMedida}</Typography>
                                </Box>
                            </Grid>

                            {/* Passo 2: Quanto tem na prateleira? */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Quantidade Física Contada"
                                    type="number"
                                    value={physicalQty}
                                    onChange={(e) => setPhysicalQty(e.target.value)}
                                    helperText="Digite o valor real que você está vendo na prateleira"
                                    autoFocus
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    Atenção: Ao confirmar, o sistema ajustará automáticamente o saldo.
                                </Alert>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    onClick={handleProcessAudit}
                                    disabled={loading || !physicalQty}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Confirmar Ajuste de Saldo'}
                                </Button>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>
        </Box>
    );
};