import React, { useState } from "react";
import { ApiService } from "../services/api";

interface EvaluatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  onNavigateTab: (tab: any) => void;
  onOpenPublish: () => void;
  onOpenTrades: () => void;
  onOpenPlayStore: () => void;
}

export const EvaluatorGuideModal: React.FC<EvaluatorGuideModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onNavigateTab,
  onOpenPublish,
  onOpenTrades,
  onOpenPlayStore,
}) => {
  const [activeTab, setActiveTab] = useState<"guion" | "rubrica" | "pruebas">("guion");

  if (!isOpen) return null;

  const handleResetDemo = async () => {
    if (window.confirm("¿Deseas restablecer todos los productos, propuestas y pujas a su estado de fábrica?")) {
      await ApiService.resetDemo();
      showToast("Datos de demostración restablecidos al estado inicial.", "success");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eval-guide-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-500 text-slate-900 flex items-center justify-center font-black">
              E
            </span>
            <div>
              <h2 id="eval-guide-title" className="text-lg font-bold">
                Panel del Evaluador y Guion de Video
              </h2>
              <p className="text-xs text-teal-300">Rúbrica 100% y Guía de Demostración Académica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center focus:ring-2 focus:ring-teal-400 outline-none"
            aria-label="Cerrar panel del evaluador"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2" role="tablist">
          {[
            { id: "guion", label: "Guion de Video (3-5 min)" },
            { id: "rubrica", label: "Matriz Rúbrica 100%" },
            { id: "pruebas", label: "Accesos Rápidos y Reset" },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === t.id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {activeTab === "guion" && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-medium">
                <strong>Estructura cronometrada recomendada para la grabación del video:</strong>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-bold text-teal-700 text-sm block mb-1">00:00 - 00:45 | Introducción y Problema</span>
                <p>
                  Presentar Truec-app: solución a la acumulación de tecnología y falta de liquidez en jóvenes/estudiantes.
                  Mostrar el inicio de sesión con validación y la credencial de demostración rápida (<code>demo@truec.app</code> / <code>demo123</code>).
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-bold text-teal-700 text-sm block mb-1">00:45 - 01:45 | Catálogo y Ficha de Detalle</span>
                <p>
                  Mostrar la búsqueda en tiempo real, filtros por categoría (Consolas, Laptops, etc.), chips de estado e insignia "Acepta trueque".
                  Entrar a un producto (PS5) para mostrar galería, especificaciones técnicas y reputación del vendedor.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-bold text-teal-700 text-sm block mb-1">01:45 - 02:45 | Flujo de Trueque y Publicación</span>
                <p>
                  Proponer trueque seleccionando un equipo de inventario propio (iPhone 12 Pro) y redactando condiciones.
                  Luego abrir el módulo de <strong>Publicar Producto</strong> para añadir un nuevo artículo al catálogo con validaciones visibles.
                  Abrir <strong>Gestión de Trueques</strong> para ver cómo el vendedor acepta o rechaza propuestas con retroalimentación inmediata.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-bold text-teal-700 text-sm block mb-1">02:45 - 03:45 | Subasta en Vivo y Publicación Play Store</span>
                <p>
                  Navegar a Subastas Activas, mostrar el cronómetro en reversa y realizar una puja superior al monto actual (ej. +$100).
                  Verificar actualización inmediata del historial. Finalizar abriendo la <strong>Simulación de Google Play Store</strong> mostrando APK listo, permisos e instalación interactiva.
                </p>
              </div>
            </div>
          )}

          {activeTab === "rubrica" && (
            <div className="space-y-3">
              {[
                {
                  title: "1. Funcionalidad e Integración de Datos",
                  pct: "25%",
                  desc: "API REST Node.js con persistencia JSON (productos, propuestas, subastas), tolerancia a fallos offline en cliente con localStorage y validación estricta.",
                },
                {
                  title: "2. Optimización del Diseño UX/UI",
                  pct: "20%",
                  desc: "Sistema Material Design 3 / HIG, paleta Teal/Navy/Amber, notificaciones Toast interactivas, estados vacíos, badges de confianza y micro-interacciones.",
                },
                {
                  title: "3. Accesibilidad y Adaptación a Dispositivos",
                  pct: "20%",
                  desc: "WCAG 2.1 AA (contraste 4.5:1+, etiquetas ARIA en todos los controles, navegación por teclado completa) y diseño responsivo fluido (móvil, tablet, escritorio).",
                },
                {
                  title: "4. Documentación y Justificación del Desarrollo",
                  pct: "20%",
                  desc: "Archivo maestro DEFENSA_Y_DOCUMENTACION_FINAL.md con justificación académica basada en encuesta (90.9%), diagramas de arquitectura y matriz de pruebas.",
                },
                {
                  title: "5. Demuestra y Simula Publicación",
                  pct: "15%",
                  desc: "PWA instalable (manifest.json, icon.svg), simulador navegable de Google Play Store con proceso de descarga/instalación y script de release.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</span>
                    <span className="font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full text-xs">
                      {item.pct}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "pruebas" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Atajos de Navegación</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => { onClose(); onNavigateTab("inicio"); }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-teal-500 text-left"
                  >
                    Ir a Inicio / Catálogo
                  </button>
                  <button
                    onClick={() => { onClose(); onNavigateTab("subastas"); }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-amber-500 text-left"
                  >
                    Ir a Subasta Activa
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenPublish(); }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-teal-700 hover:border-teal-600 text-left"
                  >
                    Publicar Producto Nuevo
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenTrades(); }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-teal-700 hover:border-teal-600 text-left"
                  >
                    Gestionar Trueques
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenPlayStore(); }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-blue-700 hover:border-blue-600 text-left col-span-2"
                  >
                    Abrir Ficha Google Play Store
                  </button>
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-900 text-xs">Restablecer Datos de Demostración</h4>
                  <p className="text-[11px] text-rose-700">Limpia los cambios locales y restaura el estado original.</p>
                </div>
                <button
                  onClick={handleResetDemo}
                  className="px-3.5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Restablecer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
