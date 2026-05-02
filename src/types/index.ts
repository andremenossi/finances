export interface Person {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  personId: string;
  categoryId: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  isConfirmed?: boolean;
}

export type TabType = 'movimentacoes' | 'futuros' | 'relatorios' | 'configuracoes';
