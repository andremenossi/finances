import React, { useState, useMemo } from 'react';
import { Filter, Search, BarChart3, PieChart as PieIcon, List, ArrowUpDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie
} from 'recharts';
import { Person, Category, Transaction } from '../types';
import { Card, Button, Input, Select, Label } from '../components/ui';

interface RelatoriosPageProps {
  people: Person[];
  categories: Category[];
  transactions: Transaction[];
  formatCurrency: (val: number) => string;
  formatDate: (d: string) => string;
}

export const RelatoriosPage: React.FC<RelatoriosPageProps> = ({
  people,
  categories,
  transactions,
  formatCurrency,
  formatDate
}) => {
  const [filters, setFilters] = useState({
    personId: '',
    categoryId: '',
    type: '' as '' | 'income' | 'expense',
    startDate: '',
    endDate: '',
    view: 'list' as 'list' | 'bars' | 'pie'
  });

  const reportTransactions = useMemo(() => {
    return transactions.filter(t => {
      const isConfirmed = t.isConfirmed !== false;
      const matchPerson = !filters.personId || t.personId === filters.personId;
      const matchCategory = !filters.categoryId || t.categoryId === filters.categoryId;
      const matchType = !filters.type || t.type === filters.type;
      const matchStart = !filters.startDate || t.date >= filters.startDate;
      const matchEnd = !filters.endDate || t.date <= filters.endDate;
      return isConfirmed && matchPerson && matchCategory && matchType && matchStart && matchEnd;
    });
  }, [transactions, filters]);

  const barChartData = useMemo(() => {
    const groups: Record<string, { date: string, name: string, income: number, expense: number }> = {};
    reportTransactions.forEach(t => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = { 
          date: dateKey,
          name: formatDate(dateKey).split('/').slice(0, 2).join('/'),
          income: 0, 
          expense: 0 
        };
      }
      if (t.type === 'income') groups[dateKey].income += t.amount;
      else groups[dateKey].expense += t.amount;
    });
    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [reportTransactions, formatDate]);

  const pieChartData = useMemo(() => {
    const groups: Record<string, { name: string, value: number, type: string }> = {};
    reportTransactions.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
      if (!groups[category]) groups[category] = { name: category, value: 0, type: t.type };
      groups[category].value += t.amount;
    });
    return Object.values(groups);
  }, [reportTransactions, categories]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={18} className="text-slate-400" />
          <h2 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest leading-none">Filtros de Auditoria</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
          <div className="space-y-1.5">
            <Label>Membro</Label>
            <Select value={filters.personId} onChange={e => setFilters({...filters, personId: e.target.value})}>
              <option value="">Todos</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})}>
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fluxo</Label>
            <Select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value as any})}>
              <option value="">Ambos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label>Fim</Label>
            <Input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <div className="lg:col-span-1 flex justify-end">
            <Button className="h-[42px] px-8" variant="primary" onClick={() => setFilters({ personId: '', categoryId: '', type: '', startDate: '', endDate: '', view: filters.view })}>
              Limpar
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex bg-white p-1 rounded-sm border border-slate-200 w-fit">
          {[
            { id: 'list', icon: List, label: 'Lista' },
            { id: 'bars', icon: BarChart3, label: 'Evolução' },
            { id: 'pie', icon: PieIcon, label: 'Categorias' }
          ].map(v => (
            <button 
              key={v.id} 
              onClick={() => setFilters({...filters, view: v.id as any})}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm border ${filters.view === v.id ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white hover:border-slate-900 border-transparent'}`}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Card className="min-h-[500px] flex flex-col">
              {filters.view === 'list' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="font-medium">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Membro</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descrição</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportTransactions.map(t => (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 group transition-all duration-200">
                          <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">{formatDate(t.date)}</td>
                          <td className="px-4 py-4 font-bold text-slate-900 uppercase tracking-tight">{people.find(p => p.id === t.personId)?.name}</td>
                          <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{t.description}</td>
                          <td className="px-4 py-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{categories.find(c => c.id === t.categoryId)?.name || 'Geral'}</span></td>
                          <td className={`px-4 py-4 text-right text-[12px] font-bold font-mono tracking-tighter ${t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                      {reportTransactions.length > 0 && (
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td colSpan={4} className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500">Saldo Filtrado</td>
                          <td className={`px-4 py-3 text-right text-[14px] font-mono tracking-tighter ${
                            reportTransactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0) >= 0 
                            ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {formatCurrency(reportTransactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0))}
                          </td>
                        </tr>
                      )}
                      {reportTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Nenhum dado encontrado para o filtro</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {filters.view === 'bars' && (
                <div className="flex-1 p-8 h-[500px]">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `R$ ${val}`} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ border: 'none', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      />
                      <Bar dataKey="income" name="Entradas" fill="#059669" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="expense" name="Saídas" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {filters.view === 'pie' && (
                <div className="flex-1 p-8 h-[500px]">
                  <ResponsiveContainer width="100%" height={400}>
                    <RePieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Resumo do Período</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entradas</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono tracking-tighter">
                    {formatCurrency(reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saídas</span>
                  <span className="text-xl font-bold text-rose-600 font-mono tracking-tighter">
                    {formatCurrency(reportTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Saldo Líquido</span>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                    {formatCurrency(reportTransactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
