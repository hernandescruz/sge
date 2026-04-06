import { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, MenuItem, Grid,
    Paper, Autocomplete, Alert, CircularProgress, InputAdornment, IconButton, Stack
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {Item, CentroCusto, Finalidade, MovimentacaoRequestDTO, Solicitante} from '../../types';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';

export const MovementsPage = () => {
    const { user } = useAuth();

    // Estados para dados vindos da API
    const [items, setItems] = useState<Item[]>([]);
    const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
    const [finalidades, setFinalidades] = useState<Finalidade[]>([]);

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
    const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);

    // Carregar dados iniciais ao abrir a página
    useEffect(() => {
        const loadData = async () => {
            try {
                // Buscamos tudo em paralelo para ganhar tempo
                const [resCC, resFin, resItems, resSol] = await Promise.all([
                    api.get<CentroCusto[]>('/centros-custo'),
                    api.get<Finalidade[]>('/finalidades'),
                    api.get<Item[]>('/itens'),
                    api.get<Solicitante[]>('/solicitantes')
                ]);

                const ccOperacionais = resCC.data.filter(cc =>
                    cc.ativo && cc.nome.toUpperCase() !== 'INVENTARIO'
                );
                setCentrosCusto(ccOperacionais);

                // 2. Filtramos as Finalidades: Ativas E que NÃO sejam "INVENTARIO"
                const finOperacionais = resFin.data.filter(f =>
                    f.ativo && f.nome.toUpperCase() !== 'INVENTARIO'
                );
                setFinalidades(finOperacionais);

                // 3. Filtramos os Solicitantes: Ativos E que NÃO sejam "ADM"
                const solOperacionais = resSol.data.filter(s =>
                    s.ativo && s.nome.toUpperCase() !== 'ADM'
                );
                setSolicitantes(solOperacionais);

                // 4. Filtramos apenas Itens ativos
                const itensAtivos = resItems.data.filter(i => i.ativo);
                setItems(itensAtivos);

            } catch (error) {
                console.error("Erro ao carregar dados", error);
                setMessage({ text: 'Falha ao conectar com o servidor.', type: 'error' });
            }
        };
        loadData();
    }, []);

    // Função executada quando o scanner lê um código
    const handleScanResult = (decodedText: string) => {
        setIsScanning(false);

        // Procuramos o item na lista local pelo código (EAN ou Código Interno)
        // Convertemos para String para garantir a comparação correta
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
            tipoMovimento: tipo,
            itemId: Number(selectedItem.id),
            quantidade: Number(quantidade),
            usuarioId: user.id,
            centroCustoId: Number(centroCustoId),
            finalidadeId: Number(finalidadeId),
            solicitanteId: Number(solicitanteId)
        };

        try {
            // Envia para o MovimentacaoController do Spring Boot
            await api.post('/movimentacoes', payload);

            setMessage({ text: 'Movimentação registrada e saldo atualizado!', type: 'success' });

            // Limpa o formulário para a próxima entrada
            setSelectedItem(null);
            setQuantidade('');
            setCentroCustoId('');
            setFinalidadeId('');

            // Opcional: Recarregar lista de itens para atualizar saldos locais
            const resItems = await api.get<Item[]>('/itens');
            setItems(resItems.data);

        } catch (err: any) {
            // Captura a mensagem de erro vinda do Java (Ex: "Saldo insuficiente")
            const erroMsg = err.response?.data || 'Erro ao registrar movimentação.';
            setMessage({ text: erroMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Se o usuário clicar no botão de scanner, mostramos apenas a câmera
    if (isScanning) {
        return (
            <Box sx={{ mt: 2 }}>
                <BarcodeScanner
                    onScanSuccess={handleScanResult}
                    onClose={() => setIsScanning(false)}
                />
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