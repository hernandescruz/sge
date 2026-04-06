import { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block'; // Ícone para inativar
import api from '../../services/api';
import { UserForm } from './UserForm';

export const UsersPage = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [openForm, setOpenForm] = useState(false);

    const handleAlterarSenha = async (id: number) => {

        const novaSenha = window.prompt("Digite a nova senha:");

        if (novaSenha && novaSenha.trim() !== "") {
            try {
                // Enviamos um objeto JSON com a chave "password"
                await api.patch(`/usuarios/${id}/alterar-senha`, { password: novaSenha });
                alert("Senha alterada com sucesso!");
            } catch (err: any) {
                console.error(err);
                alert("Erro ao alterar senha. Verifique a conexão.");
            }
        }
    };
    const handleInativar = async (id: number) => {
        if (window.confirm("Deseja INATIVAR este usuário? Ele perderá o acesso ao sistema.")) {
            await api.patch(`/usuarios/${id}/inativar`);
            carregarUsuarios();
        }
    };

    const carregarUsuarios = async () => {
        const res = await api.get('/usuarios');
        setUsuarios(res.data);
    };

    useEffect(() => { carregarUsuarios(); }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("Deseja realmente excluir este usuário?")) {
            await api.delete(`/usuarios/${id}`);
            carregarUsuarios();
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4">Gestão de Equipe</Typography>
                <Button variant="contained" onClick={() => setOpenForm(true)}>
                    <PersonAddIcon/>
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Login</TableCell>
                            <TableCell>Cargo</TableCell>
                            <TableCell>Perfil</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.map((u) => (
                            <TableRow key={u.id}
                                      sx={{
                                          backgroundColor: u.perfil === 'INATIVO' ? '#ffebee' : 'inherit', // Vermelho bem clarinho
                                          opacity: u.perfil === 'INATIVO' ? 0.7 : 1
                                      }}
                            >
                                <TableCell>{u.nome}</TableCell>
                                <TableCell>{u.usuario}</TableCell>
                                <TableCell>{u.cargo}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={u.perfil}
                                        color={u.perfil === 'ADMIN' ? 'primary' : 'default'}
                                        variant={u.perfil === 'INATIVO' ? 'outlined' : 'filled'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleAlterarSenha(u.id)} color="primary" title="Mudar Senha">
                                        <VpnKeyIcon />
                                    </IconButton>

                                    {/* Só mostramos o botão de inativar se o usuário já não estiver inativo */}
                                    {u.perfil !== 'INATIVO' && (
                                        <IconButton onClick={() => handleInativar(u.id)} color="error" title="Inativar Usuário">
                                            <BlockIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <UserForm open={openForm} onClose={() => setOpenForm(false)} onSuccess={carregarUsuarios} />
        </Box>
    );
};