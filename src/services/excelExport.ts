import * as XLSX from 'xlsx';
import { Movimentacao } from '../types';

export const exportMovimentacoesToExcel = (dados: Movimentacao[]) => {
    // 1. Preparamos os dados para o formato que o Excel entende (Colunas legíveis)
    const rows = dados.map(m => ({
        'Data/Hora': new Date(m.createdAt).toLocaleString('pt-BR'),
        'Operação': m.tipoMovimento.replace('_', ' '),
        'Código Item': m.item.codigoItem,
        'Descrição': m.item.descricao,
        'Quantidade': m.quantidade,
        'Unidade': m.item.unidadeMedida,
        'Usuário': m.usuario.nome,
        'Solicitante': m.solicitante.nome,
        'Centro de Custo': m.centroCusto.nome,
        'Finalidade': m.finalidade.nome,
        'Valor Total (R$)': m.valorTotalMovimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    }));

    // 2. Criamos uma "Planilha" (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 3. Criamos um "Livro" (Workbook) e adicionamos a planilha a ele
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimentações");

    // 4. Geramos o arquivo e forçamos o download no navegador
    const dataAtual = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Relatorio_Almoxarifado_${dataAtual}.xlsx`);
};