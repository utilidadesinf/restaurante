import { BarChart3, Database, Home, ShieldAlert, Award } from 'lucide-react';

interface AdminSidebarProps {
  activeSection: 'metrics' | 'crud';
  setActiveSection: (section: 'metrics' | 'crud') => void;
  onExit: () => void;
  dailyEarnings: number;
  ordersCount: number;
  starProduct?: string;
}

export default function AdminSidebar({
  activeSection,
  setActiveSection,
  onExit,
  dailyEarnings,
  ordersCount,
  starProduct
}: AdminSidebarProps) {
  return (
    <aside className="w-full lg:w-60 bg-secondary-custom text-white lg:min-h-screen flex flex-col justify-between py-8 px-6 shrink-0 shadow-sm border-r border-slate-100/10">
      
      <div className="space-y-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="bg-primary-custom w-3 h-3 rounded-[2px]" />
          <div>
            <h2 className="font-sans font-bold text-lg tracking-tight">FoodClick</h2>
            <p className="text-[10px] text-white/50 tracking-wider font-semibold uppercase mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Action navigation links */}
        <nav className="space-y-1">
          <button
            id="sidemenu-tab-metrics"
            onClick={() => setActiveSection('metrics')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeSection === 'metrics'
                ? 'bg-primary-custom text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas & Reportes</span>
          </button>

          <button
            id="sidemenu-tab-crud"
            onClick={() => setActiveSection('crud')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeSection === 'crud'
                ? 'bg-primary-custom text-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Gestión de Menú (CRUD)</span>
          </button>
        </nav>

        {/* Live Express Analytics Summary on the Sidebar */}
        <div className="pt-6 border-t border-white/10 space-y-4 px-1 hidden lg:block">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Resumen Express</h4>
          
          <div className="space-y-3">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="block text-[10px] text-white/55 font-semibold uppercase tracking-wider">INGRESOS DIARIOS (2026)</span>
              <span className="text-lg font-bold text-white font-sans">${dailyEarnings.toFixed(2)}</span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="block text-[10px] text-white/55 font-semibold uppercase tracking-wider">COMANDAS PROCESADAS</span>
              <span className="text-lg font-bold text-white font-sans">{ordersCount} servicios</span>
            </div>

            {starProduct && (
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex items-start gap-2.5">
                <div className="mt-0.5 bg-yellow-500/10 p-1 rounded-md">
                  <Award className="w-4 h-4 text-yellow-400 shrink-0" />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[10px] text-white/55 font-semibold uppercase tracking-wider">Plato Estrella</span>
                  <span className="text-xs font-bold text-[#FFB703] truncate block">{starProduct}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit/Change role action */}
      <div className="pt-4 border-t border-white/10 lg:border-t-0 flex flex-col gap-2">
        <button
          id="btn-admin-exit-to-role-selector"
          onClick={onExit}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <Home className="w-4 h-4" />
          <span>Cambiar de Rol</span>
        </button>
      </div>

    </aside>
  );
}
