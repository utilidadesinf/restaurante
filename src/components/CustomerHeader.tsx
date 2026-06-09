import { ShoppingCart, Compass, CheckCircle2, DollarSign } from 'lucide-react';

interface CustomerHeaderProps {
  numeroMesa: number;
  totalAcumulado: number;
  cartCount: number;
  onOpenCart: () => void;
  activeTab: 'menu' | 'cuenta';
  setActiveTab: (tab: 'menu' | 'cuenta') => void;
}

export default function CustomerHeader({
  numeroMesa,
  totalAcumulado,
  cartCount,
  onOpenCart,
  activeTab,
  setActiveTab
}: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-secondary-custom text-white shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        
        {/* Restaurant identity logo and Table indication */}
        <div className="flex items-center gap-3">
          <div className="bg-primary-custom w-3 h-3 rounded-[2px]" />
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight hidden sm:block">FoodClick</h1>
            <p className="text-[10px] text-white/50 tracking-wider font-semibold uppercase">MESA {numeroMesa < 10 ? `0${numeroMesa}` : numeroMesa}</p>
          </div>
        </div>

        {/* Desktop / Core role tabs for the client */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            id="tab-client-menu"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'menu'
                ? 'bg-primary-custom text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ver Menú</span>
          </button>
          
          <button
            id="tab-client-cuenta"
            onClick={() => setActiveTab('cuenta')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              activeTab === 'cuenta'
                ? 'bg-primary-custom text-white shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mi Mesa / Cuenta</span>
            {totalAcumulado > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Right tools (Total and active Shopping cart button) */}
        <div className="flex items-center gap-3">
          {/* Cumulative check pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-white/50 font-semibold uppercase tracking-wider">Consumido:</span>
            <span className="font-sans font-bold text-white">${totalAcumulado.toFixed(2)}</span>
          </div>

          <button
            id="btn-nav-view-cart"
            onClick={onOpenCart}
            className="bg-primary-custom hover:opacity-95 active:scale-[0.97] transition-all px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-xs"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <div className="absolute -top-2.5 -right-2.5 bg-white text-primary-custom text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-primary-custom shadow-sm animate-bounce">
                  {cartCount}
                </div>
              )}
            </div>
            <span className="text-xs tracking-wide">Pedido ({cartCount})</span>
          </button>
        </div>

      </div>
    </header>
  );
}
