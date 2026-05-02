import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFinance } from './hooks/useFinance';
import { TabType, Transaction } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dialog } from './components/Dialog';

// Pages
import { MovimentacoesPage } from './pages/MovimentacoesPage';
import { FuturosPage } from './pages/FuturosPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';

export default function App() {
  // UI State
  const [sidebarDate, setSidebarDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  
  // Global State
  const finance = useFinance(sidebarDate);
  
  const [activeTab, setActiveTab] = useState<TabType>('movimentacoes');
  const [showBalance, setShowBalance] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dialog State
  const [deleteConfig, setDeleteConfig] = useState<{ id: string, type: string, label: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Formatting Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  // Derived Data
  const totalsByPerson = useMemo(() => finance.getTotalsByPerson(sidebarDate), [finance.transactions, finance.people, sidebarDate]);

  if (!finance.isLoaded) return null;

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      <Header 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setEditingId(null); }}
        overallBalance={finance.totals.balance}
        showBalance={showBalance}
        setShowBalance={setShowBalance}
        formatCurrency={formatCurrency}
      />

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {(activeTab === 'movimentacoes' || activeTab === 'futuros') && (
            <Sidebar 
              key="sidebar"
              isVisible={true}
              people={finance.people}
              sidebarDate={sidebarDate}
              setSidebarDate={setSidebarDate}
              totalsByPerson={totalsByPerson}
              formatCurrency={formatCurrency}
            />
          )}
        </AnimatePresence>

        <main className="flex-1 bg-slate-50 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'movimentacoes' && (
              <motion.div
                key="mov"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <MovimentacoesPage 
                  people={finance.people}
                  categories={finance.categories}
                  transactions={finance.transactions}
                  editingId={editingId}
                  startDate={sidebarDate}
                  onSave={(tx, id) => { finance.saveTransaction(tx, id); setEditingId(null); }}
                  onEdit={(t) => setEditingId(t.id)}
                  onDelete={(id, type, label) => setDeleteConfig({ id, type, label })}
                  cancelEdit={() => setEditingId(null)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </motion.div>
            )}

            {activeTab === 'futuros' && (
              <motion.div
                key="fut"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <FuturosPage 
                  people={finance.people}
                  categories={finance.categories}
                  transactions={finance.transactions}
                  editingId={editingId}
                  startDate={sidebarDate}
                  onSave={(tx, id) => { finance.saveTransaction(tx, id); setEditingId(null); }}
                  onEdit={(t) => setEditingId(t.id)}
                  onDelete={(id, type, label) => setDeleteConfig({ id, type, label })}
                  onConfirm={(id) => setConfirmId(id)}
                  cancelEdit={() => setEditingId(null)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </motion.div>
            )}

            {activeTab === 'relatorios' && (
              <motion.div
                key="rel"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <RelatoriosPage 
                  people={finance.people}
                  categories={finance.categories}
                  transactions={finance.transactions}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              </motion.div>
            )}

            {activeTab === 'configuracoes' && (
              <motion.div
                key="cfg"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <ConfiguracoesPage 
                  people={finance.people}
                  categories={finance.categories}
                  addPerson={finance.addPerson}
                  deletePerson={(id, name) => setDeleteConfig({ id, type: 'person', label: name })}
                  addCategory={finance.addCategory}
                  deleteCategory={(id, name) => setDeleteConfig({ id, type: 'category', label: name })}
                  onClearData={() => setShowClearDialog(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog 
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={() => {
          if (deleteConfig?.type === 'person') finance.deletePerson(deleteConfig.id);
          else if (deleteConfig?.type === 'category') finance.deleteCategory(deleteConfig.id);
          else finance.deleteTransaction(deleteConfig!.id);
          setDeleteConfig(null);
        }}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir "${deleteConfig?.label}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
      />

      <Dialog 
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) finance.confirmTransaction(confirmId);
          setConfirmId(null);
        }}
        title="Confirmar Lançamento"
        description="Deseja confirmar a efetivação deste lançamento planejado?"
        confirmLabel="Confirmar"
        variant="success"
      />

      <Dialog 
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={() => {
          finance.clearAllData();
          setShowClearDialog(false);
        }}
        title="APAGAR TODOS OS DADOS"
        description="ATENÇÃO: Deseja realmente apagar todos os lançamentos, pessoas e categorias? Esta ação é IRREVERSÍVEL."
        confirmLabel="Apagar Tudo"
        variant="danger"
      />
    </div>
  );
}
