import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, Alert } from '@mui/material';

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <>
            {/* Aviso de Nova Versão Disponível */}
            <Snackbar
                open={needRefresh}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    variant="filled"
                    action={
                        <>
                            <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                                ATUALIZAR AGORA
                            </Button>
                            <Button color="inherit" size="small" onClick={() => close()}>
                                DEPOIS
                            </Button>
                        </>
                    }
                    sx={{ boxShadow: 3 }}
                >
                    Uma nova versão do sistema está disponível!
                </Alert>
            </Snackbar>

            {/* Aviso de que o App está pronto para uso Offline */}
            <Snackbar
                open={offlineReady}
                autoHideDuration={4000}
                onClose={() => close()}
            >
                <Alert severity="success" variant="filled">
                    Sistema instalado com sucesso! Pronto para uso offline.
                </Alert>
            </Snackbar>
        </>
    );
};