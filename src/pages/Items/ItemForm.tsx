import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Grid, Box, Alert
} from '@mui/material';
import api from '../../services/api';
import { Item } from '../../types';

interface ItemFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemParaEditar?: Item | null; // Nova prop para edição
}

export const ItemForm = ({ open, onClose, onSuccess, itemParaEditar }: ItemFormProps) => {
    const initialState = {
        codigoItem: '',
        descricao: '',
        unidadeMedida: 'PEÇA',
        localizacao: '',
        estoqueMinimo: 0,
        precoUnitario: 0
    };

    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');

    // Efeito para preencher o formulário quando for edição
    useEffect(() => {
        if (itemParaEditar) {
            setFormData({
                codigoItem: String(itemParaEditar.codigoItem),
                descricao: itemParaEditar.descricao,
                unidadeMedida: itemParaEditar.unidadeMedida,
                localizacao: itemParaEditar.localizacao || '',
                estoqueMinimo: itemParaEditar.estoqueMinimo,
                precoUnitario: itemParaEditar.precoUnitario
            });
        } else {
            setFormData(initialState);
        }
    }, [itemParaEditar, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            const payload = { ...formData, codigoItem: Number(formData.codigoItem) };

            if (itemParaEditar) {
                // MODO EDIÇÃO (PUT)
                await api.put(`/itens/${itemParaEditar.id}`, payload);
            } else {
                // MODO CRIAÇÃO (POST)
                await api.post('/itens', payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError('Erro ao salvar item. Verifique os dados ou duplicidade de código.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{itemParaEditar ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Código" fullWidth required type="number" value={formData.codigoItem}
                                       onChange={(e) => setFormData({...formData, codigoItem: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Unidade" fullWidth required value={formData.unidadeMedida}
                                       onChange={(e) => setFormData({...formData, unidadeMedida: e.target.value})}>
                                <MenuItem value="PEÇA">PEÇA</MenuItem>
                                <MenuItem value="METRO">METRO</MenuItem>
                                <MenuItem value="LITRO">LITRO</MenuItem>
                                <MenuItem value="KG">KG</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Descrição" fullWidth required value={formData.descricao}
                                       onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Localização" fullWidth value={formData.localizacao}
                                       onChange={(e) => setFormData({...formData, localizacao: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Estoque Mínimo" fullWidth type="number" value={formData.estoqueMinimo}
                                       onChange={(e) => setFormData({...formData, estoqueMinimo: Number(e.target.value)})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Preço Unitário (R$)" fullWidth type="number" value={formData.precoUnitario}
                                       onChange={(e) => setFormData({...formData, precoUnitario: Number(e.target.value)})} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">Salvar Alterações</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};