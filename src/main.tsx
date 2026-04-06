import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme'; // Importe o tema que criamos
import { registerSW } from 'virtual:pwa-register'
// O "import * as" resolve o erro de "Default export"
// garantindo que pegamos tudo que o React e o ReactDOM exportam.

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}> {}
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);

// const updateSW = registerSW({
//     onNeedRefresh() {
//         if (confirm('Nova versão disponível. Deseja atualizar?')) {
//             updateSW()
//         }
//     },
//     onOfflineReady() {
//         console.log('App pronto para uso offline!')
//     },
// })