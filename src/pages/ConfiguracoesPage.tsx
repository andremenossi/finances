import React, { useState } from 'react';
import { Users, Tag, Plus, Trash2, Github } from 'lucide-react';
import { Person, Category } from '../types';
import { Card, Button, Input, Label } from '../components/ui';

interface ConfiguracoesPageProps {
  people: Person[];
  categories: Category[];
  addPerson: (name: string) => void;
  deletePerson: (id: string, name: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string, name: string) => void;
  onClearData: () => void;
}

export const ConfiguracoesPage: React.FC<ConfiguracoesPageProps> = ({
  people,
  categories,
  addPerson,
  deletePerson,
  addCategory,
  deleteCategory,
  onClearData
}) => {
  const [newPerson, setNewPerson] = useState('');
  const [newCategory, setNewCategory] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-10">
      <div className="flex flex-col gap-12">
        {/* Gestão de Pessoas */}
        <section className="space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
                <Users size={20}/>
              </div>
              <div>
                <h2 className="text-[16px] font-black uppercase tracking-[0.15em] italic text-slate-900">Membros do Time</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Defina quem participa dos lançamentos</span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{people.length} Ativos</span>
          </header>

          <Card className="p-8">
            <form onSubmit={e => { e.preventDefault(); if(newPerson.trim()) { addPerson(newPerson.trim()); setNewPerson(''); } }} className="flex gap-3 mb-10">
              <div className="flex-1">
                <Label>Novo Membro</Label>
                <Input placeholder="Digite o nome completo..." value={newPerson} onChange={e => setNewPerson(e.target.value)} />
              </div>
              <Button type="submit" className="mt-auto h-[42px] aspect-square p-0">
                <Plus size={20}/>
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-md group hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 uppercase">{p.name.charAt(0)}</div>
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{p.name}</span>
                  </div>
                  <button onClick={() => deletePerson(p.id, p.name)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              {people.length === 0 && (
                <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center gap-3">
                    <Users size={32} className="text-slate-100" />
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest italic">Nenhum membro configurado</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Gestão de Categorias */}
        <section className="space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
                <Tag size={20}/>
              </div>
              <div>
                <h2 className="text-[16px] font-black uppercase tracking-[0.15em] italic text-slate-900">Categorias</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Categorize suas entradas e saídas</span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{categories.length} Tipos</span>
          </header>

          <Card className="p-8">
            <form onSubmit={e => { e.preventDefault(); if(newCategory.trim()) { addCategory(newCategory.trim()); setNewCategory(''); } }} className="flex gap-3 mb-10">
              <div className="flex-1">
                <Label>Nova Categoria</Label>
                <Input placeholder="Ex: Alimentação, Moradia, Lazer..." value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              </div>
              <Button type="submit" className="mt-auto h-[42px] aspect-square p-0">
                <Plus size={20}/>
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded group hover:bg-slate-900 hover:text-white transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-widest truncate pr-2">{c.name}</span>
                  <button onClick={() => deleteCategory(c.id, c.name)} className="p-1.5 text-slate-300 group-hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded">
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center gap-3">
                    <Tag size={32} className="text-slate-100" />
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest italic">Nenhuma categoria configurada</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Repositório */}
        <section className="space-y-6">
          <header className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-900 shadow-sm border border-slate-200">
              <Github size={20}/>
            </div>
            <div>
              <h2 className="text-[16px] font-black uppercase tracking-[0.15em] italic text-slate-900">Código Fonte</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Acesse o repositório no GitHub</span>
            </div>
          </header>

          <Card className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900">Projeto Finances Pro</h4>
                <p className="text-[11px] text-slate-500 font-medium">Veja o código fonte, contribua ou relate problemas no GitHub oficial.</p>
              </div>
              <a 
                href="https://github.com/andremenossi/finances" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
              >
                <Github size={16} />
                Acessar Repositório
              </a>
            </div>
          </Card>
        </section>

        {/* Zona de Perigo */}
        <section className="space-y-6">
          <header className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="p-3 bg-rose-600 rounded-lg text-white shadow-lg shadow-rose-100">
              <Trash2 size={20}/>
            </div>
            <div>
              <h2 className="text-[16px] font-black uppercase tracking-[0.15em] italic text-slate-900">Zona de Perigo</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Ações irreversíveis</span>
            </div>
          </header>

          <Card className="p-8 border-rose-100 bg-rose-50/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-rose-900">Limpar Todos os Dados</h4>
                <p className="text-[11px] text-slate-500 font-medium">Isso apagará permanentemente todos os lançamentos, pessoas e categorias.</p>
              </div>
              <Button variant="danger" onClick={onClearData} className="w-full md:w-auto">
                Apagar Tudo
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
