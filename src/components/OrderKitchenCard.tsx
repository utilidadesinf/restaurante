import { useState, useEffect } from 'react';
import { Clock, Check, Utensils } from 'lucide-react';
import { Pedido } from '../types';

interface OrderKitchenCardProps {
  key?: string | number;
  pedido: Pedido;
  onMarcarListo: (id: string) => void;
  onPreparar?: (id: string) => void;
}

export default function OrderKitchenCard({ pedido, onMarcarListo, onPreparar }: OrderKitchenCardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const getElapsed = () => {
      const sendTime = new Date(pedido.horaEnvio).getTime();
      const now = new Date().getTime();
      return Math.max(0, Math.floor((now - sendTime) / 1000));
    };

    setElapsedSeconds(getElapsed());

    const timer = setInterval(() => {
      setElapsedSeconds(getElapsed());
    }, 1000);

    return () => clearInterval(timer);
  }, [pedido.horaEnvio]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;

  // Semáforo de tiempos rule with Clean Minimalism color palette
  let statusColor = 'bg-accent-green-custom text-white';
  let badgeColor = 'bg-[#4C9F70]/10 text-accent-green-custom border-[#4C9F70]/20';
  let progressText = 'A tiempo';

  if (elapsedMinutes >= 16) {
    statusColor = 'bg-[#E63946] text-white animate-pulse';
    badgeColor = 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20';
    progressText = 'Demora Crítica (>16 min)';
  } else if (elapsedMinutes >= 8) {
    statusColor = 'bg-[#FFB703] text-slate-900';
    badgeColor = 'bg-[#FFB703]/10 text-[#FFB703] border-[#FFB703]/20';
    progressText = 'Retrasada (>8 min)';
  }

  // Format time display
  const zeroPad = (num: number) => String(num).padStart(2, '0');
  const timeDisplay = `${zeroPad(elapsedMinutes)}:${zeroPad(remainingSeconds)}`;

  return (
    <div className="bg-white border border-slate-150 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Header card with Table Number and Semaphore indicator */}
      <div className={`p-4 text-white flex justify-between items-center transition-colors duration-500 ${statusColor}`}>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl tracking-wide">MESA {pedido.mesaNumero}</h3>
            <p className="text-[10px] opacity-90 font-medium">Enviado: {new Date(pedido.horaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
        </div>
        
        {/* Dynamic Chronometer */}
        <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-full font-mono text-xs font-bold tracking-wider">
          <Clock className="w-3.5 h-3.5 text-white animate-spin-slow" />
          {timeDisplay}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Status indicator pill */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${badgeColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {progressText}
          </span>
        </div>

        {/* List of Ordered Dishes */}
        <div className="space-y-2.5 mb-5 divide-y divide-slate-100 flex-1">
          {pedido.items.map((item, index) => (
            <div key={`${item.platoId}-${index}`} className="flex justify-between items-start pt-2 text-sm">
              <div className="flex-1 pr-2">
                <span className="font-semibold text-slate-800">{item.nombre}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-xs">
                <span>x</span>
                <span className="text-sm">{item.cantidad}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {pedido.estadoCocina === 'pendiente' && onPreparar && (
            <button
              id={`btn-preparar-pedido-${pedido.id}`}
              onClick={() => onPreparar(pedido.id)}
              className="flex-1 py-2 text-xs font-semibold text-slate-705 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Iniciar Preparación
            </button>
          )}

          <button
            id={`btn-completar-pedido-${pedido.id}`}
            onClick={() => onMarcarListo(pedido.id)}
            className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-secondary-custom rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{pedido.estadoCocina === 'preparando' ? 'Marcar Listo' : 'Listo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
