import { useState, useEffect, useMemo } from 'react';
import { Person, Category, Transaction } from '../types';

const STORAGE_KEY_PEOPLE = 'financepro_people';
const STORAGE_KEY_TRANSACTIONS = 'financepro_transactions';
const STORAGE_KEY_CATEGORIES = 'financepro_categories';
const VERSION_KEY = 'financepro_v1_clean';

export function useFinance(startDateProp?: string) {
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const filterDate = startDateProp || '';

  // Load Data
  useEffect(() => {
    // Force a one-time clean start to remove all old mock/test data
    const isCleaned = localStorage.getItem(VERSION_KEY);
    if (!isCleaned) {
      localStorage.removeItem(STORAGE_KEY_PEOPLE);
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.setItem(VERSION_KEY, 'true');
      setIsLoaded(true);
      return;
    }

    const savedPeople = localStorage.getItem(STORAGE_KEY_PEOPLE);
    const savedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const savedCat = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    
    if (savedPeople) setPeople(JSON.parse(savedPeople));
    if (savedCat) setCategories(JSON.parse(savedCat));
    if (savedTx) setTransactions(JSON.parse(savedTx));
    
    setIsLoaded(true);
  }, []);

  // Sync with LocalStorage
  useEffect(() => { 
    if (isLoaded) localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people)); 
  }, [people, isLoaded]);
  
  useEffect(() => { 
    if (isLoaded) localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions)); 
  }, [transactions, isLoaded]);
  
  useEffect(() => { 
    if (isLoaded) localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories)); 
  }, [categories, isLoaded]);

  // Handlers
  const addPerson = (name: string) => {
    const newPerson = { id: crypto.randomUUID(), name };
    setPeople(prev => [...prev, newPerson]);
  };

  const deletePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.personId !== id));
  };

  const addCategory = (name: string) => {
    const newCat = { id: crypto.randomUUID(), name };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const saveTransaction = (tx: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...tx } : t));
    } else {
      setTransactions(prev => [{ id: crypto.randomUUID(), ...tx }, ...prev]);
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const confirmTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isConfirmed: true } : t));
  };

  const clearAllData = () => {
    setPeople([]);
    setCategories([]);
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY_PEOPLE);
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
  };

  // Calculations
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.isConfirmed === true || t.isConfirmed === undefined)
      .filter(t => !filterDate || t.date >= filterDate)
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const expense = transactions
      .filter(t => t.isConfirmed === true || t.isConfirmed === undefined)
      .filter(t => !filterDate || t.date >= filterDate)
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return { income, expense, balance: income - expense };
  }, [transactions, filterDate]);

  const getTotalsByPerson = (startDate?: string) => {
    const results: Record<string, { income: number; expense: number; balance: number }> = {};
    people.forEach(p => { results[p.id] = { income: 0, expense: 0, balance: 0 }; });
    
    transactions
      .filter(t => t.isConfirmed === true || t.isConfirmed === undefined) // Somente o que é real/confirmado
      .filter(t => !startDate || t.date >= startDate)
      .forEach(t => {
        if (results[t.personId]) {
          if (t.type === 'income') results[t.personId].income += t.amount;
          else results[t.personId].expense += t.amount;
        }
      });
      
    Object.keys(results).forEach(id => { results[id].balance = results[id].income - results[id].expense; });
    return results;
  };

  return {
    people,
    categories,
    transactions,
    totals,
    addPerson,
    deletePerson,
    addCategory,
    deleteCategory,
    saveTransaction,
    deleteTransaction,
    confirmTransaction,
    clearAllData,
    getTotalsByPerson,
    isLoaded
  };
}
