import { Box, Typography, Divider } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Item } from '../../types';

interface ItemLabelProps {
    item: Item;
}

export const ItemLabel = ({ item }: ItemLabelProps) => {
    return (
        <Box
            className="printable-label"
            sx={{
                width: '58mm',
                height: '40mm',
                display: 'flex',
                flexDirection: 'column',
                p: '2mm',
                boxSizing: 'border-box',
                overflow: 'hidden',
                backgroundColor: '#fff',
                color: '#000',
                // Estilo para garantir o corte no rolo térmico
                pageBreakAfter: 'always',
            }}
        >
            {/* 1. PARTE SUPERIOR: DESCRIÇÃO (Até 2 linhas) */}
            <Box sx={{ height: '12mm', overflow: 'hidden', mb: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: '9pt',
                        fontWeight: 'bold',
                        lineHeight: 1.1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Limita a 2 linhas
                        WebkitBoxOrient: 'vertical',
                        textAlign: 'center'
                    }}
                >
                    {item.descricao.toUpperCase()}
                </Typography>
            </Box>

            <Divider sx={{ mb: 1, borderColor: '#000' }} />

            {/* 2. PARTE CENTRAL: QR CODE + DADOS TÉCNICOS */}
            <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                {/* QR Code à esquerda */}
                <Box sx={{ mr: 1.5 }}>
                    <QRCodeSVG
                        value={String(item.codigoItem)}
                        size={75} // Aproximadamente 20mm
                        level="M"
                    />
                </Box>

                {/* Dados à direita */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                    <Typography sx={{ fontSize: '11pt', fontWeight: '900' }}>
                        CÓD: {item.codigoItem}
                    </Typography>

                    <Typography sx={{ fontSize: '8pt', fontWeight: 'bold' }}>
                        LOC: {item.localizacao || '---'}
                    </Typography>

                    <Typography sx={{ fontSize: '8pt' }}>
                        {item.unidadeMedida}
                    </Typography>
                </Box>
            </Box>

            {/* 3. RODAPÉ: NOME DO SISTEMA CENTRALIZADO */}
            <Box sx={{ mt: 'auto', pt: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: '5pt',
                        fontWeight: 400,
                        textAlign: 'center',
                        letterSpacing: '1px'
                    }}
                >
                    HRC SISTEMAS - SGE v1.0
                </Typography>
            </Box>
        </Box>
    );
};