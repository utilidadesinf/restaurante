import { Trash2, ShoppingBag, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Mesa } from '../types';

interface MesaGridCardProps {
  key?: string | number;
  mesa: Mesa;
  cuentaTotal: number;
  platosListosCount: number; // For pickup alerts
  onLiberar: (id: string) => void;
  onSetOcupada?: (id: string) => void;
  onSimularServido?: (mesaNumero: number) => void; // Triggered when waiter delivers food
}

export default function MesaGridCard({
  mesa,
  cuentaTotal,
  platosListosCount,
  onLiberar,
  onSetOcupada,
  onSimularServido
}: MesaGridCardProps) {
  
  // Custom design specs based on current state with flat minimal aesthetic
  let stateTitle = 'Libre';
  let stateBg = 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]';
  let pillColor = 'bg-[#2E7D32] text-white';
  
  if (mesa.estado === 'ocupada') {
    stateTitle = 'Ocupada';
    stateBg = 'bg-[#E3F2FD] border-[#BBDEFB] text-[#1565C0]';
    pillColor = 'bg-[#1565C0] text-white';
  } else if (mesa.estado === 'esperando_limpieza') {
    stateTitle = 'Limpieza';
    stateBg = 'bg-[#FFF8E1] border-dashed border-2 border-[#F9A825] text-[#F9A825]';
    pillColor = 'bg-[#F9A825] text-white';
  }

  // Override background if there's a critical "plate is ready for pickup" alert!
  const tieneComidaLista = platosListosCount > 0;
  if (tieneComidaLista && mesa.estado === 'ocupada') {
    stateTitle = 'Plato Listo!';
    stateBg = 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828] animate-pulse';
    pillColor = 'bg-[#C62828] text-white';
  }

  return (
    <div className={`p-5 rounded-xl border transition-all duration-305 flex flex-col justify-between shadow-xs ${stateBg}`}>
      
      {/* Table Title and Status indicator */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-sans font-bold text-lg tracking-tight">MESA {mesa.numeroMesa}</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${tieneComidaLista ? 'bg-[#C62828] animate-ping' : 'bg-current'}`}></span>
            <p className="text-[10px] font-bold tracking-wider uppercase">{stateTitle}</p>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider shadow-xs ${pillColor}`}>
          M{mesa.numeroMesa < 10 ? `0${mesa.numeroMesa}` : mesa.numeroMesa}
        </span>
      </div>

      <div className="my-2.5 space-y-2 flex-1">
        {/* Account balance helper */}
        {mesa.estado === 'ocupada' && (
          <div className="flex justify-between items-center bg-white/70 p-2.5 rounded-lg border border-white/40 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Cuenta
            </span>
            <span className="font-sans font-bold text-slate-800 text-sm">${cuentaTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Display alert if food lies cold in kitchen waiting for waiter pickup */}
        {tieneComidaLista && mesa.estado === 'ocupada' && (
          <div className="p-3 bg-[#C62828] text-white rounded-lg shadow-sm text-xs font-semibold space-y-1.5 flex flex-col items-center">
            <div className="text-center flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-white" />
              <span>{platosListosCount} platos listos</span>
            </div>
            {onSimularServido && (
              <button
                id={`btn-servir-platillo-mesa-${mesa.numeroMesa}`}
                onClick={() => onSimularServido(mesa.numeroMesa)}
                className="w-full py-1.5 bg-white text-[#C62828] hover:bg-slate-55 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Marcar Servido
              </button>
            )}
          </div>
        )}

        {mesa.estado === 'libre' && (
          <div className="h-full flex items-center justify-center py-4">
            <p className="text-[11px] text-[#2E7D32]/80 font-medium text-center flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" /> Disponible
            </p>
          </div>
        )}

        {mesa.estado === 'esperando_limpieza' && (
          <div className="h-full flex items-center justify-center py-4">
            <p className="text-[11px] text-[#F9A825]/80 font-semibold text-center flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F9A825]" /> Requiere Limpieza
            </p>
          </div>
        )}
      </div>

      {/* Primary user interactions */}
      <div className="pt-2 border-t border-slate-200/5 flex gap-2">
        {mesa.estado === 'libre' && onSetOcupada && (
          <button
            id={`btn-ocupar-mesa-${mesa.id}`}
            onClick={() => onSetOcupada(mesa.id)}
            className="w-full py-2 bg-secondary-custom text-white hover:bg-slate-800 text-xs font-bold rounded-lg shadow-xs transition-all hover:scale-[1.01]"
          >
            Sentar Comensal
          </button>
        )}

        {mesa.estado === 'esperando_limpieza' && (
          <button
            id={`btn-limpiar-mesa-${mesa.id}`}
            onClick={() => onLiberar(mesa.id)}
            className="w-full py-2 bg-[#FFB703] text-white hover:bg-amber-600 active:scale-[0.98] text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>Habilitar</span>
          </button>
        )}

        {mesa.estado === 'ocupada' && !tieneComidaLista && (
          <button
            id={`btn-liberar-mesa-manual-${mesa.id}`}
            onClick={() => onLiberar(mesa.id)}
            className="w-full py-2 bg-white/60 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-all"
          >
            Liberar mesa
          </button>
        )}
      </div>

    </div>
  );
}
