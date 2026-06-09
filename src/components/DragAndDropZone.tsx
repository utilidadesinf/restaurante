import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';

interface DragAndDropZoneProps {
  onImageSelected: (url: string) => void;
  currentUrl?: string;
}

const PRESET_IMAGES = [
  { name: 'Nigiri Variado', url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80' },
  { name: 'Ramen Tonkotsu', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sashimi Premium', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Baos de Cerdo', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80' },
  { name: ' Yakitori de Pollo', url: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=600&q=80' },
  { name: 'Matcha Ice Cream', url: 'https://images.unsplash.com/photo-1505394033-41a5059bb09b?auto=format&fit=crop&w=600&q=80' },
];

export default function DragAndDropZone({ onImageSelected, currentUrl }: DragAndDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Create local object URL to simulate upload
      const url = URL.createObjectURL(e.dataTransfer.files[0]);
      onImageSelected(url);
      setSelectedPreset(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onImageSelected(url);
      setSelectedPreset(null);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onImageSelected(inputUrl.trim());
      setSelectedPreset(null);
    }
  };

  const handleSelectPreset = (url: string, name: string) => {
    onImageSelected(url);
    setSelectedPreset(name);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">Imágen del Plato (Arrastrar, URL o Preset)</label>
      
      <div
        id="drag-drop-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragActive 
            ? 'border-primary-custom bg-red-50/50' 
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {currentUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white font-medium">Cambiar</span>
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Imagen seleccionada correctamente
            </p>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">
              Arrastra un archivo aquí o <span className="text-primary-custom underline hover:opacity-90">búscalo</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Soporta PNG, JPG o WebP de alta definición</p>
          </label>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">O selecciona de nuestra Galería Gourmet:</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              id={`preset-img-${preset.name.replace(/\s+/g, '-').toLowerCase()}`}
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset.url, preset.name)}
              className={`relative overflow-hidden h-14 rounded-lg text-left group transition-all duration-200 border-2 ${
                currentUrl === preset.url || selectedPreset === preset.name
                  ? 'border-primary-custom scale-[0.98]'
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-1 left-1.5 right-1.5 truncate">
                <p className="text-[10px] font-bold text-white tracking-wide truncate">{preset.name}</p>
              </div>
              {(currentUrl === preset.url || selectedPreset === preset.name) && (
                <div className="absolute top-1 right-1 bg-primary-custom text-white rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="url"
            placeholder="O pega el enlace URL de la imagen aquí..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-custom/20 focus:border-primary-custom"
          />
        </div>
        <button
          id="btn-apply-image-url"
          type="submit"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
        >
          Aplicar URL
        </button>
      </form>
    </div>
  );
}
