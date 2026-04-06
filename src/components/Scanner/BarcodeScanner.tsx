import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Button } from '@mui/material';

interface ScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, onClose }: ScannerProps) => {
    useEffect(() => {
        // Configuração do Scanner
        const scanner = new Html5QrcodeScanner(
            "reader", // ID da div onde a câmera vai aparecer
            {
                fps: 10,
                qrbox: { width: 250, height: 150 }, // Área de leitura (retângulo para códigos de barras)
                aspectRatio: 1.777778 // Formato 16:9
            },
            /* verbose= */ false
        );

        scanner.render(
            (text) => {
                scanner.clear(); // Para a câmera após ler com sucesso
                onScanSuccess(text);
            },
            (error) => {
                // Erros de leitura são comuns enquanto a câmera foca, ignoramos no console
            }
        );

        // Limpeza ao fechar o componente
        return () => {
            scanner.clear().catch(error => console.error("Falha ao limpar scanner", error));
        };
    }, [onScanSuccess]);

    return (
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#000', color: '#fff', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Aponte a Câmera para o Código</Typography>

            {/* Onde a câmera será renderizada */}
            <div id="reader" style={{ width: '100%' }}></div>

            <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={onClose}
                sx={{ mt: 2 }}
            >
                Cancelar Leitura
            </Button>
        </Box>
    );
};