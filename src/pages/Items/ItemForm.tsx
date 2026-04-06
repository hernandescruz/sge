import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Grid, Box, Alert
} from '@mui/material';
import api from '../../services/api';

interface ItemFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ItemForm = ({ open, onClose, onSuccess }: ItemFormProps) => {
    // Estado inicial do formulário (vazio)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            // Enviando para o endpoint POST /itens do seu Spring Boot
            await api.post('/itens', {
                ...formData,
                codigoItem: Number(formData.codigoItem) // Garantindo que é número
            });

            setFormData(initialState); // Limpa o formulário
            onSuccess(); // Avisa a página pai para atualizar a lista
            onClose();   // Fecha o modal
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao salvar item. Verifique se o código já existe.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Novo Item no Almoxarifado</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Código do Item"
                                fullWidth
                                required
                                type="number"
                                value={formData.codigoItem}
                                onChange={(e) => setFormData({...formData, codigoItem: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Unidade de Medida"
                                fullWidth
                                required
                                value={formData.unidadeMedida}
                                onChange={(e) => setFormData({...formData, unidadeMedida: e.target.value})}
                            >
                                <MenuItem value="PEÇA">PEÇA</MenuItem>
                                <MenuItem value="METRO">METRO</MenuItem>
                                <MenuItem value="LITRO">LITRO</MenuItem>
                                <MenuItem value="KG">KG</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Descrição do Material"
                                fullWidth
                                required
                                value={formData.descricao}
                                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Localização (Rua/Gaveta)"
                                fullWidth
                                value={formData.localizacao}
                                onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Estoque Mínimo"
                                fullWidth
                                type="number"
                                value={formData.estoqueMinimo}
                                onChange={(e) => setFormData({...formData, estoqueMinimo: Number(e.target.value)})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Preço Unitário (R$)"
                                fullWidth
                                type="number"
                                inputProps={{ step: "0.01" }}
                                value={formData.precoUnitario}
                                onChange={(e) => setFormData({...formData, precoUnitario: Number(e.target.value)})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">Salvar Item</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};