import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
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
                const wsname = wb.SheetNames[0]; // Pega a primeira aba
                const ws = wb.Sheets[wsname];

                // Transforma as linhas em JSON
                const data = XLSX.utils.sheet_to_json(ws);

                // Mapeia os nomes das colunas da planilha para o DTO do Java
                const payload = data.map((row: any) => ({
                    codigoItem: Number(row.CODIGO || row.codigoItem),
                    descricao: row.DESCRICAO || row.descricao,
                    unidadeMedida: row.UNIDADE || row.unidadeMedida,
                    localizacao: row.LOCALIZACAO || row.localizacao,
                    estoqueMinimo: Number(row.MINIMO || row.estoqueMinimo || 0),
                    precoUnitario: Number(row.PRECO || row.precoUnitario || 0)
                }));

                await api.post('/itens/lote', payload);
                onSuccess();
                onClose();
            } catch (err: any) {
                const msgs = err.response?.data;
                setError(Array.isArray(msgs) ? msgs : ["Erro ao processar arquivo. Verifique o formato."]);
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
                    A planilha deve conter as colunas:<br/>
                    <strong>CODIGO, DESCRICAO, UNIDADE, LOCALIZACAO, MINIMO, PRECO</strong>
                </Typography>

                {error && error.map((msg, i) => (
                    <Alert key={i} severity="warning" sx={{ mb: 1, fontSize: '0.8rem' }}>{msg}</Alert>
                ))}

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="outlined" component="label" fullWidth disabled={loading}>
                        {loading ? 'Processando...' : 'Selecionar Arquivo .xlsx'}
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleFile} />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};