import { useState } from 'react';
import {
    Box, AppBar, Toolbar, Typography, Button, Container, IconButton,
    Stack, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Divider, Menu, MenuItem, ListItemIcon as MuiListItemIcon
} from '@mui/material';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoImg from "../../assets/logo.png"; // Ajustado para o caminho padrão

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openAdminMenu = Boolean(anchorEl);

    const anoAtual = new Date().getFullYear();
    const corPrincipal = '#2a0017';

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleClickAdmin = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleCloseAdmin = () => setAnchorEl(null);

    const operacionais = [
        { text: 'Início', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'GERENTE', 'OPERADOR'] },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/estoque', roles: ['ADMIN', 'GERENTE', 'OPERADOR'] },
        { text: 'Movimentar', icon: <SwapHorizIcon />, path: '/movimentacoes', roles: ['ADMIN', 'GERENTE', 'OPERADOR'] },
    ];

    const administrativos = [
        { text: 'Inventário', icon: <AssessmentIcon />, path: '/inventario', roles: ['ADMIN', 'GERENTE'] },
        { text: 'Histórico', icon: <HistoryIcon />, path: '/historico', roles: ['ADMIN', 'GERENTE'] },
        { text: 'Usuários', icon: <PeopleIcon />, path: '/usuarios', roles: ['ADMIN'] },
        { text: 'Centros de Custo', icon: <SettingsIcon />, path: '/admin/centros-custo', roles: ['ADMIN', 'GERENTE'] },
        { text: 'Finalidades', icon: <SettingsIcon />, path: '/admin/finalidades', roles: ['ADMIN', 'GERENTE'] },
        { text: 'Solicitantes', icon: <PeopleIcon />, path: '/admin/solicitantes', roles: ['ADMIN', 'GERENTE', 'OPERADOR'] },
    ];

    // Conteúdo do Menu Lateral (Mobile)
    const drawer = (
        <Box sx={{ textAlign: 'center', width: 250 }}>
            <Typography variant="h6" sx={{ my: 2, color: corPrincipal, fontWeight: 'bold' }}>
                SGE Almox
            </Typography>
            <Divider />
            <List>
                {[...operacionais, ...administrativos].map((item) => {
                    if (!item.roles.includes(user?.perfil || '')) return null;
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton onClick={() => { navigate(item.path); handleDrawerToggle(); }}>
                                <ListItemIcon sx={{ color: corPrincipal }}>{item.icon}</ListItemIcon>
                                <ListItemText sx={{ color: corPrincipal }} primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={signOut}>
                        <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Sair do Sistema" sx={{ color: 'error.main' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* BARRA SUPERIOR */}
            <AppBar position="sticky" elevation={2} sx={{ backgroundColor: corPrincipal }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box
                        component="img"
                        src={logoImg}
                        alt="Logo SGE"
                        sx={{ height: 35, cursor: 'pointer', mr: 2 }}
                        onClick={() => navigate('/dashboard')}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    {/* MENU DESKTOP */}
                    <Stack direction="row" spacing={1} sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
                        {operacionais.map((item) => (
                            <Button key={item.text} color="inherit" onClick={() => navigate(item.path)}>
                                {item.text}
                            </Button>
                        ))}

                        {(user?.perfil === 'ADMIN' || user?.perfil === 'GERENTE') && (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={handleClickAdmin}
                                    endIcon={<KeyboardArrowDownIcon />}
                                >
                                    Administração
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openAdminMenu}
                                    onClose={handleCloseAdmin}
                                >
                                    {administrativos.map((item) => {
                                        if (!item.roles.includes(user?.perfil || '')) return null;
                                        return (
                                            <MenuItem
                                                key={item.text}
                                                onClick={() => { navigate(item.path); handleCloseAdmin(); }}
                                            >
                                                <MuiListItemIcon>{item.icon}</MuiListItemIcon>
                                                {item.text}
                                            </MenuItem>
                                        );
                                    })}
                                </Menu>
                            </>
                        )}
                    </Stack>

                    <Box sx={{ textAlign: 'right', mr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {user?.nome}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                            {user?.perfil}
                        </Typography>
                    </Box>

                    <IconButton color="inherit" onClick={signOut} sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* DRAWER MOBILE */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>

            {/* CONTEÚDO PRINCIPAL */}
            <Container component="main" sx={{ mt: 3, pb: 5, flexGrow: 1 }}>
                {children}
            </Container>

            {/* RODAPÉ (FOOTER) */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) => theme.palette.grey[100],
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © Copyright 2025-{anoAtual} HRC Sistemas
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" align="center">
                        SGE - Sistema de Gestão de Estoque - Almoxarifado | Versão 1.0.0
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};