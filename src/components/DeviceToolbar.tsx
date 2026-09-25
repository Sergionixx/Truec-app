import React, { useEffect, useState } from "react";
import { ViewMode } from "../types";

interface DeviceToolbarProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  isOnline: boolean;
  onOpenPublish: () => void;
  onOpenTrades: () => void;
  onOpenPlayStore: () => void;
  onOpenGuide: () => void;
}

export const DeviceToolbar: React.FC<DeviceToolbarProps> = ({
  viewMode,
  onSetViewMode,
  isOnline, onOpenPlayStore, onOpenGuide,
}) => {
  const [largeText, setLargeText] = useState(false);
  const [contrast, setContrast] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("large-text", largeText);
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [largeText, contrast]);
  return (
    <header
      className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg text-xs"
      role="banner"
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold tracking-tight text-white">
          <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900 font-black text-xs">
            T
          </div>
          <span className="text-sm font-extrabold hidden sm:inline">Truec-app</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-300 font-semibold border border-teal-700/50">
            v1.3.0 Demo
          </span>
        </div>

        {/* Online / Local badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isOnline ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"
          }`}
          title={isOnline ? "Conectado al servidor backend Node.js (puerto 3001)" : "Las escrituras requieren el servidor"}
          aria-label={`Estado de conexión: ${isOnline ? "Servidor conectado" : "Consulta local"}`}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span>{isOnline ? "API Online" : "Sin conexión · solo consulta"}</span>
        </div>
      </div>

      <div className="flex gap-3"><button onClick={onOpenPlayStore}>Simular publicación</button><button onClick={onOpenGuide}>Guía</button></div>
      <div className="flex gap-3" aria-label="Accesibilidad">
        <button aria-pressed={largeText} onClick={() => setLargeText(!largeText)}>Texto grande</button>
        <button aria-pressed={contrast} onClick={() => setContrast(!contrast)}>Alto contraste</button>
      </div>
      {/* Mode selectors */}
      <nav className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700" aria-label="Modo de visualización">
        <button
          onClick={() => onSetViewMode("phone")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            viewMode === "phone" ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          aria-pressed={viewMode === "phone"}
          title="Vista de teléfono móvil (393px)"
        >
          Teléfono
        </button>

        <button
          onClick={() => onSetViewMode("fullscreen")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            viewMode === "fullscreen" ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          aria-pressed={viewMode === "fullscreen"}
          title="Vista Tablet"
        >
          Tablet
        </button>

        <button
          onClick={() => onSetViewMode("canvas")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            viewMode === "canvas" ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
          }`}
          aria-pressed={viewMode === "canvas"}
          title="Lienzo Figma panorámico"
        >
          Lienzo Figma
        </button>
      </nav>
    </header>
  );
};
