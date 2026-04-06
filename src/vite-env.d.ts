declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module 'virtual:pwa-register' {
    import type { ComplexResponse } from 'workbox-core';
    export type RegisterSWOptions = {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisterError?: (error: any) => void;
    };
    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}