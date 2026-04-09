import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import * as XLSX from 'xlsx';
import api from '../../services/api';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ImportDialog = ({ open, onClose, onSuccess }: ImportDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string[] | null>(null);

    // Função auxiliar para tratar números vindos do Excel (converte "2,8" para 2.8)
    const parseExcelNumber = (val: any): number => {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'string') {
            // Remove pontos de milhar e troca vírgula por ponto
            const normalized = val.replace(/\./g, '').replace(',', '.');
            return parseFloat(normalized) || 0;
        }
        return Number(val) || 0;
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                // Transforma as linhas em JSON usando o cabeçalho como chave
                const data = XLSX.utils.sheet_to_json(ws);

                // Mapeia e higieniza os dados
                const payload = data.map((row: any) => ({
                    // Buscamos exatamente pelos nomes das colunas que você definiu
                    codigoItem: Math.floor(parseExcelNumber(row.CODIGO)),
                    descricao: String(row.DESCRICAO || '').trim(),
                    unidadeMedida: String(row.UNIDADE || 'PEÇA').toUpperCase().trim(),
                    localizacao: String(row.LOCALIZACAO || '').trim(),
                    estoqueMinimo: parseExcelNumber(row.MINIMO),
                    precoUnitario: parseExcelNumber(row.PRECO),
                    ativo: true // Definimos como ativo por padrão
                })).filter(item => item.codigoItem > 0 && item.descricao !== ''); // Remove linhas fantasmas do Excel

                if (payload.length === 0) {
                    setError(["Nenhum item válido encontrado na planilha. Verifique o cabeçalho."]);
                    setLoading(false);
                    return;
                }

                await api.post('/itens/lote', payload);

                // Limpa o input de arquivo para permitir subir o mesmo arquivo se corrigido
                e.target.value = "";

                onSuccess();
                onClose();
            } catch (err: any) {
                console.error(err);
                const msgs = err.response?.data;
                setError(Array.isArray(msgs) ? msgs : ["Erro ao processar arquivo. Verifique se o cabeçalho está correto (CODIGO, DESCRICAO, UNIDADE, LOCALIZACAO, MINIMO, PRECO)"]);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Importar Itens via Excel</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    A planilha <strong>deve</strong> conter o cabeçalho exatamente assim:<br/>
                    <code style={{ backgroundColor: '#eee', padding: '2px 4px' }}>CODIGO | DESCRICAO | UNIDADE | LOCALIZACAO | MINIMO | PRECO</code>
                </Typography>

                {error && error.map((msg, i) => (
                    <Alert key={i} severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>{msg}</Alert>
                ))}

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Enviando...' : 'Selecionar Planilha'}
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleFile} />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
            </DialogActions>
        </Dialog>
    );
};