import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/Login';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { ItemsPage } from './pages/Items'; // Agora vamos usar!
import { MovementsPage } from './pages/Movements';
import { InventoryPage } from './pages/Inventory';
import { HistoryPage } from './pages/History';
import { LabelsPage } from './pages/Labels';
import {UsersPage} from "./pages/Users";
import {PurposePage} from "./pages/Admin/PurposePage";
import {CostCenterPage} from "./pages/Admin/CostCenterPage";
import {RequesterPage} from "./pages/Admin/RequesterPage";
import { ReloadPrompt } from './components/ReloadPrompt';
import { AuditPage } from "./pages/Admin/AuditPage";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { signed, loading } = useAuth();
    if (loading) return <div>Carregando...</div>;
    if (!signed) return <Navigate to="/login" />;
    return <>{children}</>;
};

const HomeRedirect = () => {
    const { user, signed } = useAuth();
    if (!signed) return <Navigate to="/login" />;

    // Se for OPERADOR, a "casa" dele é o estoque.
    // Se for ADMIN/GERENTE, a "casa" é o dashboard.
    if (user?.perfil === 'OPERADOR') {
        return <Navigate to="/estoque" />;
    }
    return <Navigate to="/dashboard" />;
};

const RoleRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
    const { user, signed, loading } = useAuth();

    if (loading) return <div>Carregando...</div>;
    if (!signed) return <Navigate to="/login" />;

    // Se o perfil do usuário não estiver na lista permitida, manda pro Inicio
    if (!allowedRoles.includes(user?.perfil || '')) {
        return <Navigate to="/" />;
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ReloadPrompt />
                <Routes>
                    {/* Rota Pública */}
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/" element={<HomeRedirect />} />

                    {/* Rotas Privadas (Sempre dentro do PrivateRoute + Layout) */}
                    <Route path="/dashboard" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE',  'CONSULTOR']}>
                            <DashboardPage />
                        </RoleRoute>
                    } />

                    {/* Rota de ESTOQUE (Lista de Itens) */}
                    <Route path="/estoque" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE', 'OPERADOR' ]}>
                            <ItemsPage />
                        </RoleRoute>
                    } />

                    <Route path="/movimentacoes" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE', 'CONSULTOR']}>
                            <MovementsPage />
                        </RoleRoute>
                    } />

                    <Route path="/inventario" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE', 'OPERADOR', 'CONSULTOR']}>
                            <InventoryPage />
                        </RoleRoute>
                    } />

                    <Route path="/historico" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE']}>
                            <HistoryPage />
                        </RoleRoute>
                    } />

                    <Route path="/usuarios" element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <UsersPage />
                        </RoleRoute>
                    } />

                    <Route path="/admin/centros-custo" element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <CostCenterPage />
                        </RoleRoute>
                    } />

                    <Route path="/admin/finalidades" element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <PurposePage />
                        </RoleRoute>
                    } />

                    <Route path="/History" element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <HistoryPage />
                        </RoleRoute>
                    } />

                    <Route path="/Labels" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE']}>
                            <LabelsPage />
                        </RoleRoute>
                    } />
                    <Route path="/admin/solicitantes" element={
                        <RoleRoute allowedRoles={['ADMIN', 'GERENTE']}>
                            <RequesterPage />
                        </RoleRoute>
                    } />

                    <Route path="/admin/audit" element={
                        <RoleRoute allowedRoles={['ADMIN']}>
                            <AuditPage />
                        </RoleRoute>
                    } />


                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;