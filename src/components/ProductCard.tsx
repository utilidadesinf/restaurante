import { Plus, Maximize2 } from 'lucide-react';
import { Plato } from '../types';

interface ProductCardProps {
  key?: string | number;
  plato: Plato;
  onAgregar: (plato: Plato) => void;
  onVerDetalle: (plato: Plato) => void;
}

export default function ProductCard({ plato, onAgregar, onVerDetalle }: ProductCardProps) {
  return (
    <div className="group bg-white border border-slate-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-350 flex flex-col h-full transform hover:-translate-y-0.5">
      {/* Product Image and Overlay zoom trigger */}
      <div 
        onClick={() => onVerDetalle(plato)}
        className="relative h-44 sm:h-48 overflow-hidden bg-slate-50 cursor-pointer"
      >
        <img
          src={plato.imagenUrl}
          alt={plato.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Subtle decorative shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-60" />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-secondary-custom shadow-sm border border-slate-100">
          {plato.categoria}
        </div>

        {/* View Details modal click target hint */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="bg-white/95 text-slate-850 p-2 rounded-full shadow-md transform scale-95 group-hover:scale-100 transition-transform duration-300 flex items-center gap-1.5 text-xs font-bold">
            <Maximize2 className="w-3.5 h-3.5 text-primary-custom" />
            <span>Ver plato</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Title and price pricing row */}
          <div className="flex justify-between items-start gap-1">
            <h3 
              onClick={() => onVerDetalle(plato)}
              className="font-display font-bold text-secondary-custom text-sm leading-tight hover:text-primary-custom transition-colors cursor-pointer"
            >
              {plato.nombre}
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
            {plato.descripcion}
          </p>
        </div>

        {/* Operational Footer action row */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="h-full flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Precio</span>
            <span className="font-sans font-bold text-secondary-custom text-md sm:text-lg">
              ${plato.precio.toFixed(2)}
            </span>
          </div>

          <button
            id={`btn-add-to-cart-${plato.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAgregar(plato);
            }}
            className="bg-primary-custom hover:opacity-95 active:scale-95 text-white py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold tracking-wide transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
