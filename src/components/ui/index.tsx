import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`border border-slate-200 rounded-sm shadow-sm transition-all duration-300 ${!className.includes('bg-') ? 'bg-white' : ''} ${className}`}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-white hover:text-slate-900 border border-slate-900',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-white hover:text-slate-900 border border-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-white hover:text-rose-600 border border-rose-600',
    ghost: 'text-slate-400 hover:text-slate-900 hover:bg-slate-100',
    success: 'bg-emerald-600 text-white hover:bg-white hover:text-emerald-600 border border-emerald-600'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-[9px]',
    md: 'h-[42px] px-6 text-[10px]',
    lg: 'h-12 px-8 text-xs'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-white border border-slate-200 rounded-sm px-4 py-2 text-[12px] font-medium text-slate-800 tracking-tight placeholder:text-slate-300 outline-none focus:border-slate-900 transition-all ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className = '', ...props }) => (
  <select 
    className={`w-full bg-white border border-slate-200 rounded-sm px-4 py-2 text-[12px] font-medium text-slate-800 tracking-tight cursor-pointer outline-none focus:border-slate-900 transition-all appearance-none ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 leading-none">
    {children}
  </label>
);
