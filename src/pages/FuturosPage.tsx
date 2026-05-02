import React, { useState, useMemo, useRef } from 'react';
import { Plus, Check, X, TrendingUp, TrendingDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Person, Category, Transaction } from '../types';
import { Card, Button, Input, Select, Label } from '../components/ui';

interface FuturosPageProps {
  people: Person[];
  categories: Category[];
  transactions: Transaction[];
  onSave: (tx: Omit<Transaction, 'id'>, id?: string) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string, type: string, label: string) => void;
  onConfirm: (id: string) => void;
  editingId: string | null;
  startDate?: string;
  cancelEdit: () => void;
  formatCurrency: (val: number) => string;
  formatDate: (d: string) => string;
}

export const FuturosPage: React.FC<FuturosPageProps> = ({
  people,
  categories,
  transactions,
  onSave,
  onEdit,
  onDelete,
  onConfirm,
  editingId,
  startDate,
  cancelEdit,
  formatCurrency,
  formatDate
}) => {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  const todayString = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    personId: '',
    categoryId: '',
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: tomorrowString
  });

  const isEditingRef = useRef(false);

  // Handle Editing State Sync and Scroll Focus
  React.useEffect(() => {
    if (editingId) {
      const t = transactions.find(tx => tx.id === editingId);
      if (t) {
        // Captura a posição exata antes do início da edição
        if (!isEditingRef.current) {
          scrollPosRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          isEditingRef.current = true;
        }

        setFormData({
          personId: t.personId,
          categoryId: t.categoryId,
          type: t.type,
          description: t.description,
          amount: t.amount.toString(),
          date: t.date
        });

        // Executa o scroll suave garantindo que a animação de escala não interfira
        requestAnimationFrame(() => {
          setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => descriptionRef.current?.focus(), 600);
          }, 50);
        });
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        description: '', 
        amount: '',
        date: tomorrowString
      }));

      // Retorno suave para a posição salva anteriormente
      if (isEditingRef.current && scrollPosRef.current > 0) {
        const targetPos = scrollPosRef.current;
        isEditingRef.current = false;
        scrollPosRef.current = 0;
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
          }, 50);
        });
      } else {
        isEditingRef.current = false;
        scrollPosRef.current = 0;
      }
    }
  }, [editingId, transactions, tomorrowString]);

  const [incomeSortOrder, setIncomeSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expenseSortOrder, setExpenseSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pendencySortOrder, setPendencySortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [plannedIncomeStartDate, setPlannedIncomeStartDate] = useState('');
  const [plannedExpenseStartDate, setPlannedExpenseStartDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountVal = parseFloat(formData.amount);
    if (amountVal < 0) return;

    onSave({
      ...formData,
      amount: amountVal,
      isConfirmed: false
    }, editingId || undefined);
    
    if (!editingId) {
      setFormData(prev => ({ ...prev, description: '', amount: '' }));
      // Focus back to description field
      setTimeout(() => {
        descriptionRef.current?.focus();
      }, 0);
    }
  };

  const futureIncomes = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.isConfirmed === false && t.date > todayString)
      .filter(t => !startDate || t.date >= startDate)
      .filter(t => !plannedIncomeStartDate || t.date >= plannedIncomeStartDate)
      .sort((a, b) => {
        const res = a.date.localeCompare(b.date);
        return incomeSortOrder === 'asc' ? res : -res;
      });
  }, [transactions, todayString, incomeSortOrder, plannedIncomeStartDate, startDate]);

  const futureExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.isConfirmed === false && t.date > todayString)
      .filter(t => !startDate || t.date >= startDate)
      .filter(t => !plannedExpenseStartDate || t.date >= plannedExpenseStartDate)
      .sort((a, b) => {
        const res = a.date.localeCompare(b.date);
        return expenseSortOrder === 'asc' ? res : -res;
      });
  }, [transactions, todayString, expenseSortOrder, plannedExpenseStartDate, startDate]);

  const pendencies = useMemo(() => {
    return transactions
      .filter(t => t.isConfirmed === false && t.date <= todayString)
      .filter(t => !startDate || t.date >= startDate)
      .sort((a, b) => {
        const res = a.date.localeCompare(b.date);
        return pendencySortOrder === 'asc' ? res : -res;
      });
  }, [transactions, todayString, pendencySortOrder, startDate]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      <Card ref={formRef} className={`p-8 transition-all duration-300 ${editingId ? 'ring-2 ring-amber-400 bg-amber-50/10 scale-[1.01] shadow-xl' : ''}`}>
        <header className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white">
            <Plus size={18} />
          </div>
          <div>
            <h2 className="text-[14px] font-black uppercase tracking-widest italic">{editingId ? 'Editar Planejamento' : 'Lançamento Planejado'}</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Compromissos futuros</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-x-5 gap-y-4 items-end">
          <div className="xl:col-span-2 space-y-1.5">
            <Label>Pessoa</Label>
            <Select required value={formData.personId} onChange={e => setFormData({...formData, personId: e.target.value})}>
              <option value="">Selecione...</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>

          <div className="xl:col-span-2 space-y-1.5">
             <Label>Tipo</Label>
             <div className="relative flex bg-slate-100 p-1 rounded h-[42px] w-full border border-slate-200 overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ 
                    x: formData.type === 'income' ? 0 : '100%',
                    backgroundColor: formData.type === 'income' ? '#059669' : '#e11d48'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded shadow-sm z-0"
                />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'income'})} 
                  className={`relative flex-1 text-[9px] font-bold uppercase transition-colors z-10 ${formData.type === 'income' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Entrada
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'expense'})} 
                  className={`relative flex-1 text-[9px] font-bold uppercase transition-colors z-10 ${formData.type === 'expense' ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Saída
                </button>
             </div>
          </div>

          <div className="xl:col-span-4 space-y-1.5">
            <Label>Descrição</Label>
            <Input 
              ref={descriptionRef}
              required 
              placeholder="Ex: Aluguel..." 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="xl:col-span-2 space-y-1.5">
            <Label>Categoria</Label>
            <Select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div className="xl:col-span-2 space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" min="0" required placeholder="0,00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>

          <div className="xl:col-span-2 space-y-1.5">
             <Label>Data</Label>
             <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={tomorrowString} />
          </div>

          <div className="xl:col-span-10 flex justify-end">
            <AnimatePresence mode="wait">
              {!editingId ? (
                <motion.div
                  key="add-btn"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button type="submit" className="px-8" disabled={people.length === 0}>
                    <Plus size={18} className="mr-2"/>
                    Planejar
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="edit-btns"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2"
                >
                  <button 
                    type="submit" 
                    className="w-[34px] h-[34px] flex items-center justify-center bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm group"
                    title="Salvar"
                  >
                    <Check size={16} className="transition-transform group-hover:scale-110" />
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="w-[34px] h-[34px] flex items-center justify-center bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm group"
                    title="Cancelar"
                  >
                    <X size={16} className="transition-transform group-hover:scale-110" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </Card>

      <div className="space-y-8 flex flex-col">
        {/* Pendências */}
        <section className="card-serious overflow-hidden flex flex-col min-h-[400px] border-amber-200 bg-amber-50/5 shadow-amber-100">
           <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-amber-100/20 shrink-0">
             <div className="flex items-center gap-2">
               <TrendingUp size={18} className="text-amber-600 rotate-90" />
               <h3 className="text-[12px] font-black text-amber-900 uppercase tracking-wider">Pendências</h3>
               <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded leading-none">{pendencies.length}</span>
             </div>
             
             <button 
               onClick={() => setPendencySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
               className="p-1 border border-amber-300 rounded hover:bg-amber-50 transition-colors"
             >
               <ChevronUp size={14} className={`text-amber-700 transform transition-transform ${pendencySortOrder === 'desc' ? 'rotate-180' : ''}`} />
             </button>
           </div>
           
           <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
               <thead className="sticky top-0 bg-amber-100/50 backdrop-blur-sm border-b border-amber-200 shadow-sm z-10">
                 <tr className="font-medium">
                   <th className="px-4 py-3 text-[10px] font-bold text-amber-900 uppercase tracking-tight">Pessoa</th>
                   <th className="px-4 py-3 text-[10px] font-bold text-amber-900 uppercase tracking-tight">Descrição</th>
                   <th className="px-4 py-3 text-[10px] font-bold text-amber-900 uppercase tracking-tight text-right">Valor</th>
                   <th className="px-4 py-3 w-16 text-amber-900"></th>
                 </tr>
               </thead>
               <tbody>
                 {pendencies.map(t => (
                   <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 group transition-all duration-200 odd:bg-white even:bg-slate-50/20">
                     <td className="px-4 py-3 align-top whitespace-nowrap">
                       <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">{people.find(p => p.id === t.personId)?.name}</span>
                     </td>
                     <td className="px-4 py-3 align-top min-w-[200px]">
                       <div className="flex flex-col">
                         <span className="text-[12px] font-medium tracking-tight leading-tight">{t.description}</span>
                         <div className="flex flex-wrap items-center gap-x-2 mt-1">
                           <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{categories.find(c => c.id === t.categoryId)?.name}</span>
                           <span className="text-[10px] font-bold tracking-tighter whitespace-nowrap group-hover:text-amber-300 transition-colors underline decoration-2 underline-offset-2">• {formatDate(t.date)}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-4 py-3 text-right align-top whitespace-nowrap">
                       <span className={`text-[12px] font-bold font-mono tracking-tighter ${t.type === 'income' ? 'text-emerald-700 group-hover:text-emerald-300' : 'text-rose-700 group-hover:text-rose-300'}`}>
                         {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                       </span>
                     </td>
                     <td className="px-4 py-3 align-top whitespace-nowrap">
                       <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onConfirm(t.id)} className="p-1.5 bg-white text-slate-900 rounded border border-white hover:bg-emerald-600 hover:text-white transition-all"><Check size={12}/></button>
                         <button onClick={() => onDelete(t.id, 'transaction', t.description)} className="p-1.5 bg-white text-slate-900 rounded border border-white hover:bg-rose-600 hover:text-white transition-all"><X size={12}/></button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Futuros Incomes */}
            <section className="card-serious overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-700" />
                <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Entradas Planejadas</h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded leading-none">{futureIncomes.length}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        value={plannedIncomeStartDate}
                        onChange={(e) => setPlannedIncomeStartDate(e.target.value)}
                        className="text-[9px] font-bold p-1 bg-white border border-slate-200 rounded uppercase tracking-tighter"
                        placeholder="A partir de..."
                    />
                    <button 
                    onClick={() => setIncomeSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 border border-slate-200 rounded hover:bg-white transition-colors"
                    >
                    <ChevronUp size={14} className={`transform transition-transform ${incomeSortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm z-10">
                    <tr className="font-medium">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">Pessoa</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">Descrição</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight text-right">Valor</th>
                    <th className="px-4 py-3 w-12 text-slate-500"></th>
                    </tr>
                </thead>
                <tbody>
                    {futureIncomes.map(t => (
                      <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-100 group transition-all duration-200 odd:bg-white even:bg-slate-50/50">
                        <td className="px-4 py-3 align-top whitespace-nowrap text-slate-900">
                        <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">{people.find(p => p.id === t.personId)?.name}</span>
                        </td>
                        <td className="px-4 py-3 align-top min-w-[200px] text-slate-600">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-medium tracking-tight leading-tight">{t.description}</span>
                            <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-slate-400">{categories.find(c => c.id === t.categoryId)?.name}</span>
                            <span className="text-[10px] font-bold whitespace-nowrap opacity-60 text-slate-400">• {formatDate(t.date)}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-3 text-right align-top whitespace-nowrap">
                        <span className="text-[12px] font-bold font-mono tracking-tighter text-emerald-700">+{formatCurrency(t.amount)}</span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)} className="p-1.5 bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-slate-900 transition-all"><Edit3 size={14}/></button>
                            <button onClick={() => onDelete(t.id, 'transaction', t.description)} className="p-1.5 bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-slate-900 transition-all"><Trash2 size={14}/></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Estimado</span>
                <span className="text-sm font-bold text-emerald-800 font-mono tracking-tighter">{formatCurrency(futureIncomes.reduce((a, b) => a + b.amount, 0))}</span>
            </div>
            </section>

            {/* Futuros Expenses */}
            <section className="card-serious overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-rose-700" />
                <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Saídas Planejadas</h3>
                <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded leading-none">{futureExpenses.length}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        value={plannedExpenseStartDate}
                        onChange={(e) => setPlannedExpenseStartDate(e.target.value)}
                        className="text-[9px] font-bold p-1 bg-white border border-slate-200 rounded uppercase tracking-tighter"
                        placeholder="A partir de..."
                    />
                    <button 
                    onClick={() => setExpenseSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 border border-slate-200 rounded hover:bg-white transition-colors"
                    >
                    <ChevronUp size={14} className={`transform transition-transform ${expenseSortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm z-10">
                    <tr className="font-medium">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">Pessoa</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">Descrição</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight text-right">Valor</th>
                    <th className="px-4 py-3 w-12 text-slate-500"></th>
                    </tr>
                </thead>
                <tbody>
                    {futureExpenses.map(t => (
                      <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-100 group transition-all duration-200 odd:bg-white even:bg-slate-50/50">
                        <td className="px-4 py-3 align-top whitespace-nowrap text-slate-900">
                        <span className="text-[11px] font-bold uppercase tracking-tight leading-tight">{people.find(p => p.id === t.personId)?.name}</span>
                        </td>
                        <td className="px-4 py-3 align-top min-w-[200px] text-slate-600">
                        <div className="flex flex-col">
                            <span className="text-[12px] font-medium tracking-tight leading-tight">{t.description}</span>
                            <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-slate-400">{categories.find(c => c.id === t.categoryId)?.name}</span>
                            <span className="text-[10px] font-bold whitespace-nowrap opacity-60 text-slate-400">• {formatDate(t.date)}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-3 text-right align-top whitespace-nowrap">
                        <span className="text-[12px] font-bold font-mono tracking-tighter text-rose-700">-{formatCurrency(t.amount)}</span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(t)} className="p-1.5 bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-slate-900 transition-all"><Edit3 size={14}/></button>
                            <button onClick={() => onDelete(t.id, 'transaction', t.description)} className="p-1.5 bg-slate-900 text-white rounded border border-slate-900 hover:bg-white hover:text-slate-900 transition-all"><Trash2 size={14}/></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Estimado</span>
                <span className="text-sm font-bold text-rose-800 font-mono tracking-tighter">{formatCurrency(futureExpenses.reduce((a, b) => a + b.amount, 0))}</span>
            </div>
            </section>
        </div>
      </div>
    </div>
  );
};
