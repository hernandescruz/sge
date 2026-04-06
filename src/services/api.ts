import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:8082', // URL padrão do Spring Boot
    baseURL: import.meta.env.VITE_API_URL
});

// Interceptor para adicionar o Token JWT em cada requisição automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@Almox:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Se a resposta for sucesso (200, 201), apenas deixa passar
        return response;
    },
    (error) => {
        // Se o erro for 401 (Token inválido/expirado) ou 403 (Proibido)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

            console.warn("Sessão expirada ou inválida. Redirecionando para login...");

            // 1. Limpa os dados do navegador (Token e Usuário)
            localStorage.removeItem('@Almox:token');
            localStorage.removeItem('@Almox:user');

            // 2. Força o redirecionamento para a tela de login
            // Usamos window.location porque aqui estamos fora do contexto do React Router
            window.location.href = '/login';
        }

        // Retorna o erro para que o componente que fez a chamada também saiba que falhou
        return Promise.reject(error);
    }
);

export default api;