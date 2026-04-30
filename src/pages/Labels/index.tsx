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
            try {
                const res = await api.get<Item[]>('/itens');
                setItems(res.data.filter(i => i.ativo));
            } catch (error) {
                console.error("Erro ao carregar itens", error);
            }
        };
        load();
    }, []);

    const toggleItem = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Box>
            {/* CSS DE IMPRESSÃO OTIMIZADO (Leve e sem looping) */}
            <style>
                {`
                    /* Estilo para a tela normal */
                    .only-print { display: none; }

                    @media print {
                        /* 1. Esconde os blocos principais da interface do sistema */
                        header, nav, footer, .no-print, .MuiAppBar-root, .MuiDrawer-root { 
                            display: none !important; 
                        }

                        /* 2. Garante que o container de etiquetas ocupe o topo */
                        .only-print { 
                            display: block !important; 
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 58mm;
                        }

                        /* 3. Configuração da Etiqueta Térmica */
                        @page { 
                            size: 58mm 40mm; 
                            margin: 0; 
                        }

                        body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                        }
                    }
                `}
            </style>

            {/* INTERFACE DE SELEÇÃO (Escondida na impressão via classe .no-print) */}
            <Box className="no-print">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ color: '#2a0017', fontWeight: 'bold' }}>
                        Gerador de Etiquetas
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ bgcolor: '#2a0017', '&:hover': { bgcolor: '#40001d' } }}
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                    >
                        Imprimir Selecionadas ({selectedIds.length})
                    </Button>
                </Stack>

                <Paper sx={{ p: 2, mb: 4, boxShadow: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Selecione os itens:</Typography>
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
                                    label={
                                        <Typography variant="body2">
                                            <strong>{item.codigoItem}</strong> - {item.descricao}
                                        </Typography>
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Box>

            {/* ÁREA DE IMPRESSÃO (Aparece apenas no papel/impressora) */}
            <Box className="only-print">
                {items
                    .filter(i => selectedIds.includes(Number(i.id)))
                    .map(item => (
                        <ItemLabel key={item.id} item={item} />
                    ))
                }
            </Box>
        </Box>
    );
};