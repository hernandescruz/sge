import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import api from '../../services/api';
import { AuditoriaLog } from '../../types';

export const AuditPage = () => {
    const [logs, setLogs] = useState<AuditoriaLog[]>([]);

    useEffect(() => {
        api.get<AuditoriaLog[]>('/auditoria').then(res => setLogs(res.data));
    }, []);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#2a0017' }}>Trilha de Auditoria</Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell>Usuário</TableCell>
                            <TableCell>Módulo</TableCell>
                            <TableCell>Ação</TableCell>
                            <TableCell>Detalhes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} hover>
                                <TableCell>{new Date(log.dataHora).toLocaleString('pt-BR')}</TableCell>
                                <TableCell><strong>{log.usuario}</strong></TableCell>
                                <TableCell><Chip label={log.modulo} size="small" variant="outlined" /></TableCell>
                                <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{log.acao}</Typography></TableCell>
                                <TableCell sx={{ fontSize: '0.85rem' }}>{log.detalhes}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};