import React from 'react';
import { motion } from 'motion/react';
import { Person, Transaction } from '../../types';
import { Card } from '../ui';

interface SidebarProps {
  isVisible: boolean;
  people: Person[];
  sidebarDate: string;
  setSidebarDate: (date: string) => void;
  totalsByPerson: Record<string, { income: number; expense: number; balance: number }>;
  formatCurrency: (val: number) => string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isVisible, 
  people, 
  sidebarDate, 
  setSidebarDate,
  totalsByPerson,
  formatCurrency 
}) => {
  if (!isVisible) return null;

  return (
    <motion.aside 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 300, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="bg-white border-r border-slate-200 h-full flex flex-col shrink-0 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 bg-slate-50/30">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Resumo Geral desde:</label>
        <input 
          type="date" 
          value={sidebarDate}
          onChange={(e) => setSidebarDate(e.target.value)}
          className="w-full text-[11px] font-bold p-1.5 border border-slate-200 rounded-sm bg-white outline-none focus:border-slate-900"
        />
      </div>
      <div className="p-6 space-y-6 custom-scrollbar overflow-y-auto">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
              Membros Associados
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{people.length}</span>
          </div>
          
          <div className="space-y-3">
            {people.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-200 rounded text-[10px] text-slate-400 font-medium text-center italic">
                Nenhum membro configurado
              </div>
            ) : (
              people.map(p => (
                <Card key={p.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 truncate pr-2 uppercase tracking-tight">{p.name}</span>
                    <div className={`text-[10px] font-bold ${totalsByPerson[p.id]?.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {totalsByPerson[p.id]?.balance >= 0 ? 'Crédito' : 'Débito'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                     <span>Saldo</span>
                     <span className={`font-bold ${totalsByPerson[p.id]?.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                       {formatCurrency(totalsByPerson[p.id]?.balance || 0)}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-tighter">Entradas</span>
                      <span className="text-[10px] font-bold text-emerald-600">+{formatCurrency(totalsByPerson[p.id]?.income || 0)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-tighter">Saídas</span>
                      <span className="text-[10px] font-bold text-rose-600">-{formatCurrency(totalsByPerson[p.id]?.expense || 0)}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.aside>
  );
};
