import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Checkbox,
    FormControlLabel, Paper, Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import api from '../../services/api';
import { Item } from '../../types';
import { ItemLabel } from '../../components/Labels/ItemLabel';

export const LabelsPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        const load = async () => {
            const res = await api.get<Item[]>('/itens');
            setItems(res.data.filter(i => i.ativo));
        };
        load();
    }, []);

    const toggleItem = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        window.print(); // Abre o diálogo de impressão do navegador
    };

    return (
        <Box>
            {/* Cabeçalho que some na impressão */}
            <Box sx={{ display: 'block', '@media print': { display: 'none' } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4">Gerador de Etiquetas</Typography>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                    >
                        Imprimir Selecionadas ({selectedIds.length})
                    </Button>
                </Stack>

                <Paper sx={{ p: 2, mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Selecione os itens para gerar etiquetas:</Typography>
                    <Grid container spacing={1}>
                        {items.map(item => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedIds.includes(Number(item.id))}
                                            onChange={() => toggleItem(Number(item.id))}
                                        />
                                    }
                                    label={`${item.codigoItem} - ${item.descricao}`}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Box>

            {/* ÁREA DE IMPRESSÃO (Visível apenas na hora de imprimir ou no preview) */}
            <Box sx={{
                display: 'none',
                '@media print': {
                    display: 'block',
                    padding: 0,
                    margin: 0
                }
            }}>
                <Grid container spacing={2}>
                    {items
                        .filter(i => selectedIds.includes(Number(i.id)))
                        .map(item => (
                            <Grid item key={item.id}>
                                <ItemLabel item={item} />
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
        </Box>
    );
};