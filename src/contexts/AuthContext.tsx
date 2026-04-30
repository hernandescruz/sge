import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthData } from '../types';

interface AuthContextData {
    signed: boolean;
    user: User | null;
    signIn(usuario: string, password: string): Promise<void>;
    signOut(): void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ao carregar o app, verifica se já existe um token salvo
        const storagedUser = localStorage.getItem('@Almox:user');
        const storagedToken = localStorage.getItem('@Almox:token');

        if (storagedUser && storagedToken) {
            setUser(JSON.parse(storagedUser));
        } else {
            // Se não houver, garante que o estado do usuário seja nulo
            setUser(null);
        }
        setLoading(false);
    }, []);

    async function signIn(usuario: string, password: string) {
        // Chamada ao seu endpoint /login do Spring Boot
        const response = await api.post<AuthData>('/login', { usuario, password });

        const { token, dados } = response.data;

        const userLogged: User = {
            id: Number(dados[0]),
            nome: dados[1],
            cargo: dados[2],
            perfil: dados[3] as 'ADMIN' | 'OPERADOR' | 'GERENTE'
        };

        setUser(userLogged);

        // Salva no LocalStorage para não deslogar ao dar F5
        localStorage.setItem('@Almox:token', token);
        localStorage.setItem('@Almox:user', JSON.stringify(userLogged));

    }

    function signOut() {
        localStorage.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para facilitar o uso
export function useAuth() {
    return useContext(AuthContext);
}