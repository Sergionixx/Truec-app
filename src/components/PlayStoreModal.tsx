import React, { useState } from "react";

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({ isOpen, onClose, showToast }) => {
  const [installState, setInstallState] = useState<"idle" | "downloading" | "installing" | "installed">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen) return null;

  const handleInstallSimulation = () => {
    if (installState === "installed") {
      showToast("La aplicación ya se encuentra instalada en el emulador/dispositivo.", "info");
      return;
    }

    setInstallState("downloading");
    setDownloadProgress(15);

    const timer1 = setTimeout(() => setDownloadProgress(45), 600);
    const timer2 = setTimeout(() => setDownloadProgress(85), 1200);
    const timer3 = setTimeout(() => {
      setDownloadProgress(100);
      setInstallState("installing");
      const timer4 = setTimeout(() => {
        setInstallState("installed");
        showToast("¡Truec-app v1.2.0 instalada exitosamente en el dispositivo!", "success");
      }, 1000);
      return () => clearTimeout(timer4);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playstore-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Google Play App Bar */}
        <div className="bg-white px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M3.6 1.7L13.8 12 3.6 22.3c-.4-.3-.6-.8-.6-1.4V3.1c0-.6.2-1.1.6-1.4z" />
              <path fill="#FBBC04" d="M17.2 8.6L13.8 12l3.4 3.4 3.8-2.2c1.1-.6 1.1-1.7 0-2.4l-3.8-2.2z" />
              <path fill="#EA4335" d="M3.6 22.3l10.2-10.3 3.4 3.4-11.8 6.8c-.8.5-1.4.3-1.8-.1z" />
              <path fill="#34A853" d="M3.6 1.7l11.8 6.8-3.4 3.5L1.8 1.8c.4-.4 1-.6 1.8-.1z" />
            </svg>
            <span className="font-semibold text-slate-700 text-sm">Google Play Store — Ficha Oficial</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center focus:ring-2 focus:ring-teal-600 outline-none"
            aria-label="Cerrar ficha de Google Play"
          >
            ✕
          </button>
        </div>

        {/* Store content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main App Header */}
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-teal-600 to-navy-900 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-teal-500 to-slate-900 flex items-center justify-center text-white text-3xl font-black">
                T
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 id="playstore-title" className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Truec-app: Marketplace Tech
              </h1>
              <p className="text-teal-700 font-semibold text-xs sm:text-sm mt-0.5">Truec Circular Systems Inc.</p>
              <p className="text-slate-400 text-xs mt-0.5">Contiene compras virtuales simuladas</p>

              {/* Stats badges */}
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-100 text-center">
                <div>
                  <div className="flex items-center justify-center font-bold text-slate-800 text-xs sm:text-sm">
                    4.8 <span className="text-amber-500 ml-0.5">★</span>
                  </div>
                  <div className="text-[10px] text-slate-400">1.2 mil reseñas</div>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">10K+</div>
                  <div className="text-[10px] text-slate-400">Descargas</div>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <div className="w-5 h-5 rounded border border-slate-700 mx-auto text-[10px] font-bold flex items-center justify-center text-slate-700">
                    3+
                  </div>
                  <div className="text-[10px] text-slate-400">Para todos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div>
            {installState === "idle" && (
              <button
                onClick={handleInstallSimulation}
                className="w-full py-3.5 px-6 rounded-xl bg-teal-700 text-white font-bold text-sm hover:bg-teal-800 transition-all shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-700 outline-none"
              >
                <span>Instalar en el dispositivo</span>
                <span className="text-teal-200 text-xs font-normal">(24.6 MB)</span>
              </button>
            )}

            {installState === "downloading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Descargando paquete APK...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {installState === "installing" && (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                <span>Instalando en el sistema Android...</span>
              </button>
            )}

            {installState === "installed" && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInstallState("idle");
                    showToast("Aplicación desinstalada del entorno de prueba.", "info");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-teal-700 font-bold text-sm hover:bg-slate-50"
                >
                  Desinstalar
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 text-white font-bold text-sm hover:bg-teal-800 shadow-md"
                >
                  Abrir App
                </button>
              </div>
            )}
          </div>

          {/* Screenshots Carousel */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Capturas de pantalla del prototipo</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { title: "Catálogo", bg: "bg-teal-700", subtitle: "Filtros por categoría y estado" },
                { title: "Detalle", bg: "bg-blue-900", subtitle: "Especificaciones y reputación" },
                { title: "Trueque", bg: "bg-emerald-800", subtitle: "Comparativa y oferta" },
                { title: "Subasta", bg: "bg-amber-600", subtitle: "Pujas en tiempo real" },
                { title: "Publicar", bg: "bg-indigo-800", subtitle: "Registro fácil de tecnología" },
              ].map((shot, idx) => (
                <div
                  key={idx}
                  className={`w-36 h-64 rounded-2xl flex-shrink-0 ${shot.bg} text-white p-3 flex flex-col justify-between shadow-sm`}
                >
                  <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Pantalla {idx + 1}</div>
                  <div className="text-center my-auto">
                    <div className="text-xs font-bold">{shot.title}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 leading-tight">{shot.subtitle}</div>
                  </div>
                  <div className="text-[9px] text-center opacity-60">Truec-app v1.2</div>
                </div>
              ))}
            </div>
          </div>

          {/* What's New */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Novedades de la versión 1.2.0 (Build 12)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Módulo completo para publicar artículos tecnológicos con fotos y valor estimado.</li>
              <li>Panel interactivo de gestión de propuestas de trueque con estados Aceptada/Rechazada.</li>
              <li>Cumplimiento riguroso de accesibilidad WCAG 2.1 AA (contraste, foco y lectores de pantalla).</li>
              <li>Soporte PWA con manifiesto web para instalación sin tienda física.</li>
              <li>Modo tolerante a fallos: almacenamiento local automático si el backend está desconectado.</li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Información técnica de publicación</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Versión del APK</span>
                <span className="font-bold text-slate-700">1.2.0-release (12)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">SO Requerido</span>
                <span className="font-bold text-slate-700">Android 8.0 (API 26+)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Arquitectura</span>
                <span className="font-bold text-slate-700">universal (arm64, x86_64)</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Firma criptográfica</span>
                <span className="font-bold text-slate-700">SHA-256 v2/v3 Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
