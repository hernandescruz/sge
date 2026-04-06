import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#2a0017', // Um Verde Floresta (Ótimo para Almoxarifado Industrial)
            contrastText: '#fff', // Cor do texto sobre o verde
        },
        secondary: {
            main: '#ff9100', // Um Laranja para botões de destaque/alerta
        },
        background: {
            default: '#f4f6f8', // Cor de fundo das páginas
        },
    },
    // Você também pode personalizar as bordas dos botões aqui
    shape: {
        borderRadius: 8,
    },
});