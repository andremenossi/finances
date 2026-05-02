import React from 'react';
import { Wallet, Eye, EyeOff, LayoutGrid, Calendar, PieChart, Settings } from 'lucide-react';
import { TabType } from '../../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  overallBalance: number;
  showBalance: boolean;
  setShowBalance: (show: boolean) => void;
  formatCurrency: (val: number) => string;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  overallBalance, 
  showBalance, 
  setShowBalance,
  formatCurrency 
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded text-white flex items-center justify-center">
            <Wallet size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">FinancePro</h1>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Gestão Financeira</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Saldo Consolidado</span>
            <div className="flex items-center gap-2">
              <div className="w-[140px] flex justify-end">
                <span className={`text-lg font-bold tracking-tight transition-all duration-300 ${overallBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'} ${!showBalance ? 'blur-md select-none pointer-events-none' : ''}`}>
                  {formatCurrency(overallBalance)}
                </span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center w-8 h-8"
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="px-6 flex gap-8">
        {[
          { id: 'movimentacoes', label: 'Movimentações', icon: LayoutGrid },
          { id: 'futuros', label: 'Futuros', icon: Calendar },
          { id: 'relatorios', label: 'Relatórios', icon: PieChart },
          { id: 'configuracoes', label: 'Configurações', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`py-3 text-[11px] font-bold transition-all flex items-center gap-2 border-b-2 uppercase tracking-wide ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
