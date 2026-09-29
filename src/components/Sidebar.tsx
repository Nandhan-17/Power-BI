import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Table2, 
  FileSearch, 
  ShoppingBag, 
  Laptop, 
  Shirt, 
  Store,
  Sparkles
} from 'lucide-react';
import type { CategoryType } from '../types';

interface SidebarProps {
  activeTab: 'overview' | 'analytics' | 'table' | 'mappings';
  setActiveTab: (tab: 'overview' | 'analytics' | 'table' | 'mappings') => void;
  categoryType: CategoryType;
  sanitizedTitle: string;
  totalRows: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  categoryType,
  sanitizedTitle,
  totalRows
}) => {
  const getBrandIcon = () => {
    switch (categoryType) {
      case 'grocery':
        return <ShoppingBag className="w-5 h-5 text-emerald-950" />;
      case 'electronics':
        return <Laptop className="w-5 h-5 text-emerald-950" />;
      case 'fashion':
        return <Shirt className="w-5 h-5 text-emerald-950" />;
      default:
        return <Store className="w-5 h-5 text-emerald-950" />;
    }
  };

  const getCategoryBadgeLabel = () => {
    switch (categoryType) {
      case 'grocery':
        return 'Grocery Store';
      case 'electronics':
        return 'Tech & Electronics';
      case 'fashion':
        return 'Fashion & Apparel';
      default:
        return 'E-Commerce Store';
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Custom Chart Builder', icon: BarChart3 },
    { id: 'table', label: 'Cleaned Records', icon: Table2 },
    { id: 'mappings', label: 'Data Audit & Schema', icon: FileSearch },
  ] as const;

  return (
    <aside className="w-64 bg-[#022B14] border-r border-[#053B1E] flex flex-col justify-between shrink-0 min-h-screen text-slate-200 select-none shadow-2xl">
      <div>
        <div className="p-5 border-b border-[#053B1E] bg-[#011F0E]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#84CC16] to-[#22C55E] flex items-center justify-center shadow-lg shadow-lime-950/50">
              {getBrandIcon()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-white truncate tracking-tight">
                {sanitizedTitle || 'Analytics Engine'}
              </h2>
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#22C55E]/20 text-[#84CC16] text-[10px] font-bold uppercase tracking-wider border border-[#84CC16]/30">
                {getCategoryBadgeLabel()}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1.5 mt-2">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500/80">
            Workspace Views
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#84CC16] to-[#22C55E] text-[#022B14] shadow-lg shadow-lime-950/40 font-bold'
                    : 'text-slate-300 hover:bg-[#053B1E] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#022B14]' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 m-3 rounded-2xl bg-[#011F0E] border border-[#053B1E]">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-lime-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Dataset</span>
        </div>
        <div className="text-xs text-slate-300 flex justify-between items-center mb-1">
          <span>Loaded Records:</span>
          <span className="font-bold text-white">{totalRows.toLocaleString()}</span>
        </div>
        <div className="w-full bg-[#053B1E] h-1.5 rounded-full overflow-hidden">
          <div className="bg-lime-400 h-full w-full rounded-full" />
        </div>
      </div>
    </aside>
  );
};
