export type UnidadeMedida = 'PEÇA' | 'METRO' | 'LITRO' | 'KG';

export type TipoMovimento = 'ENTRADA' | 'SAIDA' | 'ENTRADA_AJUSTE' | 'SAIDA_AJUSTE';

export interface Item {
    id: number;
    codigoItem: number;
    descricao: string;
    unidadeMedida: UnidadeMedida;
    localizacao?: string;
    estoqueMinimo: number;
    estoqueAtual: number;
    precoUnitario: number;
    ativo: boolean;
}

export interface Solicitante {
    id: number;
    nome: string;
    ativo: boolean;
}

export interface Usuario {
    id: number;
    usuario: string;
    nome: string;
    cargo: string;
}

export interface AuthData {
    token: string;
    dados: string[]; // No seu Java: [id, nome, cargo]
}

export interface User {
    id: number;
    nome: string;
    cargo: string;
    perfil: 'ADMIN' | 'OPERADOR' | 'GERENTE';
}
export interface CentroCusto {
    id: number;
    nome: string;
    ativo: boolean;
}

export interface Finalidade {
    id: number;
    nome: string;
    ativo: boolean;
}

// O que enviaremos para o seu MovimentacaoController.java
export interface MovimentacaoRequestDTO {
    tipoMovimento: 'ENTRADA' | 'SAIDA' | 'ENTRADA_AJUSTE' | 'SAIDA_AJUSTE';
    itemId: number;
    quantidade: number;
    usuarioId: number;
    centroCustoId: number;
    finalidadeId: number;
    solicitanteId: number;
}

export interface Movimentacao {
    id: number;
    tipoMovimento: TipoMovimento;
    item: Item;
    quantidade: number;
    valorTotalMovimentacao: number;
    usuario: Usuario;
    centroCusto: CentroCusto;
    finalidade: Finalidade;
    solicitante: Solicitante;
    createdAt: string;
}

export interface AuditoriaLog {
    id: number;
    dataHora: string;
    usuario: string;
    modulo: string;
    acao: string;
    detalhes: string;
}