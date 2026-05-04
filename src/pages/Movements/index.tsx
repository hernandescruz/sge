import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, TextField, Button, MenuItem, Grid,
    Paper, Autocomplete, Alert, CircularProgress, InputAdornment, IconButton, Stack
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Item, CentroCusto, Finalidade, MovimentacaoRequestDTO, Solicitante } from '../../types';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';

export const MovementsPage = () => {
    const { user } = useAuth();

    // Estados para dados vindos da API
    const [items, setItems] = useState<Item[]>([]);
    const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
    const [finalidades, setFinalidades] = useState<Finalidade[]>([]);
    const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);

    // Estados do formulário
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
    const [quantidade, setQuantidade] = useState('');
    const [centroCustoId, setCentroCustoId] = useState('');
    const [finalidadeId, setFinalidadeId] = useState('');
    const [solicitanteId, setSolicitanteId] = useState('');

    // Estados de controle de interface
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

    // --- FUNÇÃO AUXILIAR PARA EXTRAIR LISTA (Evita erro de Paginação) ---
    const extrairLista = (obj: any) => {
        if (!obj) return [];
        if (obj.content && Array.isArray(obj.content)) return obj.content;
        if (Array.isArray(obj)) return obj;
        return [];
    };

    // --- FUNÇÃO DE CARREGAMENTO (Pode ser chamada a qualquer momento) ---
    const loadData = useCallback(async () => {
        try {
            const [resCC, resFin, resItems, resSol] = await Promise.all([
                api.get('/centros-custo'),
                api.get('/finalidades'),
                api.get('/itens?size=10000'), // Base grande para o scanner/busca
                api.get('/solicitantes')
            ]);

            // Processamento dos Itens
            const listaItens = extrairLista(resItems.data);
            setItems(listaItens.filter((i: any) => i.ativo === true));

            // Processamento de Centros de Custo (Filtra Inventário)
            const listaCC = extrairLista(resCC.data);
            setCentrosCusto(listaCC.filter((cc: any) =>
                cc.ativo && cc.nome.toUpperCase() !== 'INVENTÁRIO' && cc.nome.toUpperCase() !== 'INVENTARIO'
            ));

            // Processamento de Finalidades (Filtra Inventário)
            const listaFin = extrairLista(resFin.data);
            setFinalidades(listaFin.filter((f: any) =>
                f.ativo && f.nome.toUpperCase() !== 'INVENTÁRIO' && f.nome.toUpperCase() !== 'INVENTARIO'
            ));

            // Processamento de Solicitantes (Filtra ADM)
            const listaSol = extrairLista(resSol.data);
            setSolicitantes(listaSol.filter((s: any) =>
                s.ativo && s.nome.toUpperCase() !== 'ADM'
            ));

        } catch (error) {
            console.error("Erro ao carregar dados", error);
            setMessage({ text: 'Erro de conexão com o servidor.', type: 'error' });
        }
    }, []);

    // Carregar ao montar a página
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleScanResult = (decodedText: string) => {
        setIsScanning(false);
        const itemEncontrado = items.find(i => String(i.codigoItem) === decodedText);

        if (itemEncontrado) {
            setSelectedItem(itemEncontrado);
            setMessage({ text: `Item localizado: ${itemEncontrado.descricao}`, type: 'success' });
        } else {
            setSelectedItem(null);
            setMessage({ text: `Código [${decodedText}] não encontrado ou ITEM INATIVO!`, type: 'error' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !user) {
            setMessage({ text: 'Selecione um item válido.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: 'success' });

        const payload: MovimentacaoRequestDTO = {
            tipoMovimento: tipo as any,
            itemId: Number(selectedItem.id),
            quantidade: Number(quantidade),
            usuarioId: user.id,
            // Regra: Se for entrada, o Java ignora o 0 e usa os padrões. Se saída, usa o selecionado.
            centroCustoId: tipo === 'SAIDA' ? Number(centroCustoId) : 0,
            finalidadeId: tipo === 'SAIDA' ? Number(finalidadeId) : 0,
            solicitanteId: tipo === 'SAIDA' ? Number(solicitanteId) : 0
        };

        try {
            await api.post('/movimentacoes', payload);
            setMessage({ text: 'Movimentação registrada com sucesso!', type: 'success' });

            // Limpeza do formulário
            setSelectedItem(null);
            setQuantidade('');
            setCentroCustoId('');
            setFinalidadeId('');
            setSolicitanteId('');

            // --- ATUALIZAÇÃO SEGURA ---
            // Chamamos a função loadData que já trata a paginação corretamente
            await loadData();

        } catch (err: any) {
            const erroMsg = err.response?.data || 'Erro ao registrar movimentação.';
            setMessage({ text: erroMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (isScanning) {
        return (
            <Box sx={{ mt: 2 }}>
                <BarcodeScanner onScanSuccess={handleScanResult} onClose={() => setIsScanning(false)} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', pb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Typography variant="h4">Movimentação</Typography>
            </Stack>

            <Paper sx={{ p: 4, elevation: 3 }}>
                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* Seleção do Item com Lupa e Câmera */}
                        <Grid item xs={12}>
                            <Autocomplete<Item>
                                options={items}
                                getOptionLabel={(option) => `${option.codigoItem} - ${option.descricao}`}
                                value={selectedItem}
                                onChange={(_, newValue) => setSelectedItem(newValue)}
                                // Usamos o (params: any) para desativar a verificação rigorosa apenas neste ponto
                                renderInput={(params: any) => {
                                    // Extraímos o InputProps original para não perdê-lo
                                    const { InputProps, ...rest } = params;

                                    return (
                                        <TextField
                                            {...rest} // Passamos o restante dos parâmetros (label, etc)
                                            label="Selecionar Item"
                                            placeholder="Digite o código ou nome..."
                                            required
                                            InputProps={{
                                                ...InputProps, // Mantemos o comportamento original do Autocomplete
                                                endAdornment: (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => setIsScanning(true)}
                                                                title="Usar Câmera"
                                                            >
                                                                <QrCodeScannerIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                        {/* O endAdornment original (a setinha do select) vem aqui */}
                                                        {InputProps.endAdornment}
                                                    </Box>
                                                ),
                                            }}
                                        />
                                    );
                                }}
                            />
                            {selectedItem && (
                                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>
                                    Estoque Atual: {selectedItem.estoqueAtual} {selectedItem.unidadeMedida} | Local: {selectedItem.localizacao || 'N/A'}
                                </Typography>
                            )}
                        </Grid>

                        {/* Tipo de Movimento (Entrada ou Saída) */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Operação"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as any)}
                                required
                            >
                                <MenuItem value="ENTRADA">ENTRADA (Reposição)</MenuItem>
                                <MenuItem value="SAIDA">SAÍDA (Consumo)</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Quantidade a ser movimentada */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Quantidade"
                                type="number"
                                inputProps={{ step: "0.01", min: "0.01" }}
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                                required
                            />
                        </Grid>

                        {tipo === 'SAIDA' && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Dados de Destino
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Centro de Custo"
                                        value={centroCustoId}
                                        onChange={(e) => setCentroCustoId(e.target.value)}
                                        required={tipo === 'SAIDA'}
                                    >
                                        {centrosCusto.map((cc) => (
                                            <MenuItem key={cc.id} value={cc.id}>{cc.nome}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Finalidade / Destino"
                                        value={finalidadeId}
                                        onChange={(e) => setFinalidadeId(e.target.value)}
                                        required={tipo === 'SAIDA'}
                                    >
                                        {finalidades.map((f) => (
                                            <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Solicitante (Quem retirou?)"
                                        value={solicitanteId}
                                        onChange={(e) => setSolicitanteId(e.target.value)}
                                        required={tipo === 'SAIDA'}
                                    >
                                        {solicitantes.map((s) => (
                                            <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </>
                        )}

                        {/*/!* Se for ENTRADA, mostramos um aviso simples *!/*/}
                        {/*{tipo === 'ENTRADA' && (*/}
                        {/*    <Grid item xs={12}>*/}
                        {/*        <Alert severity="info">*/}
                        {/*            <strong>Operação de Reposição:</strong> O Centro de Custo, Finalidade e Solicitante serão preenchidos automaticamente como padrão de Almoxarifado.*/}
                        {/*        </Alert>*/}
                        {/*    </Grid>*/}
                        {/*)}*/}

                        {/* Botão de Confirmação */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{ height: 56, mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar e Atualizar Estoque'}
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};