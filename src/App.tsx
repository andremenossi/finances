import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trash2, 
  Edit3,
  Search,
  Wallet,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Person {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  personId: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

const STORAGE_KEY_PEOPLE = 'financeiro_simples_people';
const STORAGE_KEY_TRANSACTIONS = 'financeiro_simples_transactions';

export default function App() {
  // State
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ id: string, type: 'person' | 'transaction', label: string } | null>(null);
  
  // Form Refs for Focus
  const descRef = useRef<HTMLInputElement>(null);
  
  // NEW PERSON STATE
  const [newPersonName, setNewPersonName] = useState('');
  
  // NEW/EDIT TX STATE
  const [newTx, setNewTx] = useState({
    personId: '',
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    date: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
  });

  // Load Data
  useEffect(() => {
    const savedPeople = localStorage.getItem(STORAGE_KEY_PEOPLE);
    const savedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    
    if (savedPeople) setPeople(JSON.parse(savedPeople));
    if (savedTx) setTransactions(JSON.parse(savedTx));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Derived Values
  const totalsByPerson = useMemo(() => {
    const results: Record<string, { income: number; expense: number; balance: number }> = {};
    people.forEach(p => {
      results[p.id] = { income: 0, expense: 0, balance: 0 };
    });
    transactions.forEach(t => {
      if (results[t.personId]) {
        if (t.type === 'income') results[t.personId].income += t.amount;
        else results[t.personId].expense += t.amount;
      }
    });
    Object.keys(results).forEach(id => {
      results[id].balance = results[id].income - results[id].expense;
    });
    return results;
  }, [people, transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const overallBalance = totalIncome - totalExpense;

  // Handlers
  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const person: Person = { id: crypto.randomUUID(), name: newPersonName.trim() };
    setPeople([...people, person]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    const person = people.find(p => p.id === id);
    setDeleteConfig({ id, type: 'person', label: person?.name || 'esta pessoa' });
  };

  const confirmDelete = () => {
    if (!deleteConfig) return;
    
    if (deleteConfig.type === 'person') {
      setPeople(people.filter(p => p.id !== deleteConfig.id));
      setTransactions(transactions.filter(t => t.personId !== deleteConfig.id));
    } else {
      setTransactions(transactions.filter(t => t.id !== deleteConfig.id));
    }
    setDeleteConfig(null);
  };

  const saveTransaction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTx.personId || !newTx.description || !newTx.amount) return;

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? {
        ...t,
        personId: newTx.personId,
        type: newTx.type,
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        date: newTx.date
      } : t));
      setEditingId(null);
    } else {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        personId: newTx.personId,
        type: newTx.type,
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        date: newTx.date
      };
      setTransactions([transaction, ...transactions]);
    }

    // Reset keeping person and date
    setNewTx({ ...newTx, description: '', amount: '' });
    
    // Recovery focus to description
    setTimeout(() => descRef.current?.focus(), 10);
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setNewTx({
      personId: t.personId,
      type: t.type,
      description: t.description,
      amount: t.amount.toString(),
      date: t.date
    });
    descRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTx({ ...newTx, description: '', amount: '' });
  };

  const removeTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    setDeleteConfig({ id, type: 'transaction', label: tx?.description || 'esta transação' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar: Management */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Wallet size={20} />
            </div>
            <h1 className="font-bold text-slate-900 tracking-tight">Financeiro Simples</h1>
          </div>

          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Adicionar Pessoa</h2>
          <form onSubmit={addPerson} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome..." 
              value={newPersonName}
              onChange={e => setNewPersonName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={18} />
            </button>
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Saldo por Pessoa</h2>
          <div className="space-y-3">
            {people.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-200 rounded-xl">
                Nenhum membro cadastrado
              </div>
            ) : (
              people.map(p => (
                <div key={p.id} className="relative group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-[14px] text-slate-800 truncate mr-2">{p.name}</span>
                    <span className={`font-black text-[13px] ${totalsByPerson[p.id]?.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(totalsByPerson[p.id]?.balance || 0)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Recebeu</span>
                      <span className="text-[11px] font-bold text-emerald-600">{formatCurrency(totalsByPerson[p.id]?.income || 0)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Gastou</span>
                      <span className="text-[11px] font-bold text-rose-600">{formatCurrency(totalsByPerson[p.id]?.expense || 0)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => removePerson(p.id)}
                    className="absolute -right-2 -top-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Consolidado</div>
          <div className={`text-2xl font-black tracking-tight ${overallBalance >= 0 ? 'text-indigo-900' : 'text-rose-700'}`}>
            {formatCurrency(overallBalance)}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Header / Global Stats */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            Movimentações
          </h1>
        </header>

        {/* Global Entry UI */}
        <div className="p-8 pb-0 shrink-0">
           <form 
            onSubmit={saveTransaction} 
            className={`flex flex-wrap items-end gap-3 p-5 rounded-2xl border transition-all ${editingId ? 'bg-amber-50 border-amber-200 shadow-md ring-2 ring-amber-400/20' : 'bg-white border-slate-200 shadow-sm'}`}
          >
             <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Para quem?</label>
                <select 
                  required
                  value={newTx.personId}
                  onChange={e => setNewTx({...newTx, personId: e.target.value})}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Selecione...</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
             </div>
             
             <div className="w-32">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Tipo</label>
                <select 
                  value={newTx.type}
                  onChange={e => setNewTx({...newTx, type: e.target.value as 'income' | 'expense'})}
                  className={`w-full text-xs font-bold py-2.5 px-3 border rounded-lg outline-none ${newTx.type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                >
                  <option value="income">Recebimento</option>
                  <option value="expense">Despesa</option>
                </select>
             </div>

             <div className="flex-[2] min-w-[200px]">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Origem / Descrição</label>
                <input 
                  ref={descRef}
                  type="text" 
                  required
                  placeholder="Ex: Salário, Supermercado..."
                  value={newTx.description}
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                  className="w-full text-xs font-medium py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
             </div>

             <div className="w-32">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newTx.amount}
                  onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveTransaction();
                    }
                  }}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
             </div>

             <div className="w-32">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Data</label>
                <input 
                  type="date" 
                  required
                  value={newTx.date}
                  onChange={e => setNewTx({...newTx, date: e.target.value})}
                  className="w-full text-[10px] font-bold py-2.5 px-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
             </div>

             {editingId ? (
               <div className="flex gap-2">
                 <button 
                  type="submit"
                  className="bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg px-4 h-10 hover:bg-amber-600 transition-colors shadow-sm"
                 >
                   Atualizar
                 </button>
                 <button 
                  type="button"
                  onClick={cancelEdit}
                  className="bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg px-3 h-10 hover:bg-slate-300 transition-colors"
                 >
                   Cancelar
                 </button>
               </div>
             ) : (
               <button 
                type="submit"
                disabled={people.length === 0}
                className="bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg px-6 h-10 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
               >
                 Adicionar
               </button>
             )}
           </form>
        </div>

        {/* Content Grid */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden min-h-0">
          
          {/* Column 1: Recebimentos */}
          <section className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
            <div className="p-5 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Recebimentos
              </h3>
              <div className="text-xs font-black text-emerald-600/60 uppercase">{transactions.filter(t => t.type === 'income').length} itens</div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
              <table className="w-full text-[12px] text-left">
                <thead className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 sticky top-0 bg-white z-10">
                  <tr>
                    <th className="py-3 w-1/4">Pessoa</th>
                    <th className="py-3 w-1/4">Origem</th>
                    <th className="py-3 w-1/4">Data</th>
                    <th className="py-3 w-1/4 text-right">Valor</th>
                    <th className="py-3 w-12 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.filter(t => t.type === 'income').map(t => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-500">{people.find(p => p.id === t.personId)?.name || '---'}</td>
                      <td className="py-3 font-medium text-slate-800">{t.description}</td>
                      <td className="py-3 text-slate-400">{formatDate(t.date)}</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(t.amount)}</td>
                      <td className="py-3 text-right flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity px-2">
                        <button onClick={() => startEdit(t)} className="text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => removeTransaction(t.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-50/40 border-t border-emerald-100 flex justify-between items-center shrink-0">
               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Total Recebido</span>
               <span className="text-lg font-black text-emerald-600">{formatCurrency(totalIncome)}</span>
            </div>
          </section>

          {/* Column 2: Despesas */}
          <section className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
            <div className="p-5 border-b border-slate-100 bg-rose-50/20 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-rose-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> Despesas
              </h3>
              <div className="text-xs font-black text-rose-600/60 uppercase">{transactions.filter(t => t.type === 'expense').length} itens</div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-2 custom-scrollbar">
              <table className="w-full text-[12px] text-left">
                <thead className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 sticky top-0 bg-white z-10">
                  <tr>
                    <th className="py-3 w-1/4">Pessoa</th>
                    <th className="py-3 w-1/4">Descrição</th>
                    <th className="py-3 w-1/4">Data</th>
                    <th className="py-3 w-1/4 text-right">Valor</th>
                    <th className="py-3 w-12 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.filter(t => t.type === 'expense').map(t => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-500">{people.find(p => p.id === t.personId)?.name || '---'}</td>
                      <td className="py-3 font-medium text-slate-800">{t.description}</td>
                      <td className="py-3 text-slate-400">{formatDate(t.date)}</td>
                      <td className="py-3 text-right font-bold text-rose-600">{formatCurrency(t.amount)}</td>
                      <td className="py-3 text-right flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity px-2">
                        <button onClick={() => startEdit(t)} className="text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => removeTransaction(t.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-rose-50/40 border-t border-rose-100 flex justify-between items-center shrink-0">
               <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Total Gasto</span>
               <span className="text-lg font-black text-rose-600">{formatCurrency(totalExpense)}</span>
            </div>
          </section>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfig(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-sm text-center text-slate-500 mb-8 px-4 leading-relaxed">
                Tem certeza que deseja apagar <strong>"{deleteConfig.label}"</strong>? 
                {deleteConfig.type === 'person' && " Todas as transações vinculadas também serão removidas."}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfig(null)}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-6 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}

// Removing previous subcomponents as they are no longer needed in this spreadsheet view
