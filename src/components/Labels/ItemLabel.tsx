import { Box, Typography, Paper } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Item } from '../../types';

interface ItemLabelProps {
    item: Item;
}

export const ItemLabel = ({ item }: ItemLabelProps) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                width: '300px', // Tamanho padrão para etiquetas
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                pageBreakInside: 'avoid', // Evita que a etiqueta corte entre páginas ao imprimir
                mb: 2,
                border: '2px solid #000'
            }}
        >
            {/* O QR Code gerado a partir do Código do Item */}
            <Box>
                <QRCodeSVG
                    value={String(item.codigoItem)}
                    size={80}
                    level="H" // Nível de correção de erro alto para ambientes industriais
                />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                    HRC - SGE ALMOX
                </Typography>
                <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.2, mb: 0.5 }}>
                    {item.descricao}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    CÓD: {item.codigoItem}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                    LOCAL: {item.localizacao || 'N/A'}
                </Typography>
                <Typography variant="caption">
                    UNID: {item.unidadeMedida}
                </Typography>
            </Box>
        </Paper>
    );
};