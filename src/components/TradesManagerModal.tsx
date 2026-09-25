import { useModalFocus } from "./useModalFocus";
import React, { useState, useEffect } from "react";
import { TradeProposal } from "../types";
import { ApiService } from "../services/api";

interface TradesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export const TradesManagerModal: React.FC<TradesManagerModalProps> = ({ isOpen, onClose, showToast }) => {
  const [trades, setTrades] = useState<TradeProposal[]>([]);
  const [activeTab, setActiveTab] = useState<"todas" | "pendientes" | "finalizadas">("todas");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTrades();
    }
  }, [isOpen]);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getTrades();
      let currentUserName = "Sergio Mendoza";
      try {
        const sess = localStorage.getItem("truec-session");
        if (sess) {
          const u = JSON.parse(sess).user;
          if (u?.name) currentUserName = u.name;
        }
      } catch {}

      const userTrades = currentUserName.toLowerCase().includes("sergio") || currentUserName.toLowerCase().includes("demo")
        ? data
        : data.filter((t) => t.senderName === currentUserName || t.sellerName === currentUserName);

      setTrades(userTrades);
    } catch {
      showToast("Error al cargar historial de propuestas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tradeId: number, newStatus: "accepted" | "rejected") => {
    try {
      await ApiService.updateTradeStatus(tradeId, newStatus);
      showToast(
        newStatus === "accepted" ? "¡Has aceptado la propuesta de trueque!" : "Has rechazado la propuesta.",
        newStatus === "accepted" ? "success" : "info"
      );
      loadTrades();
    } catch (err: any) {
      showToast(err.message || "Error al actualizar propuesta", "error");
    }
  };

  const handleDeleteTrade = async (tradeId: number) => {
    if (window.confirm("¿Deseas eliminar esta propuesta de trueque del registro?")) {
      try {
        await ApiService.deleteTrade(tradeId);
        showToast("Propuesta eliminada correctamente.", "info");
        loadTrades();
      } catch (err: any) {
        showToast(err.message || "Error al eliminar la propuesta", "error");
      }
    }
  };

  const dialogRef = useModalFocus(isOpen, onClose);
  if (!isOpen) return null;

  const filtered = trades.filter((t) => {
    if (activeTab === "pendientes") return t.status === "pending";
    if (activeTab === "finalizadas") return t.status === "accepted" || t.status === "rejected";
    return true;
  });

  const getStatusBadge = (status: TradeProposal["status"]) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Pendiente</span>;
      case "accepted":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Aceptada</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Rechazada</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
      ref={dialogRef} role="dialog"
      aria-modal="true"
      aria-labelledby="modal-trades-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
                T
              </span>
              <h2 id="modal-trades-title" className="text-xl font-bold text-slate-800">
                Gestión de Trueques
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Revisa y responde a las propuestas de intercambio</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center focus:ring-2 focus:ring-teal-600 outline-none"
            aria-label="Cerrar modal de trueques"
          >
            ✕
          </button>
        </div>

        {/* Tabs de Filtro */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2" role="tablist" aria-label="Filtro de propuestas">
          {[
            { id: "todas", label: `Todas (${trades.length})` },
            { id: "pendientes", label: `Pendientes (${trades.filter((t) => t.status === "pending").length})` },
            { id: "finalizadas", label: `Historial (${trades.filter((t) => t.status !== "pending").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Cargando propuestas...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="font-bold text-slate-700">No hay propuestas en esta sección</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Explora el catálogo para proponer tu primer intercambio tecnológico.
              </p>
            </div>
          ) : (
            filtered.map((trade) => (
              <div
                key={trade.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 transition-all hover:border-teal-300"
              >
                {/* Status & Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(trade.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(trade.status)}
                    <button
                      hidden={trade.senderId !== ApiService.session()?.user.id || trade.status !== "pending"} onClick={() => handleDeleteTrade(trade.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md text-xs font-bold transition-colors focus:ring-1 focus:ring-rose-500"
                      aria-label="Eliminar propuesta de trueque"
                      title="Eliminar propuesta de trueque"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Exchange summary */}
                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Producto deseado</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{trade.wantedProductName}</span>
                    <span className="text-slate-500 text-[11px]">de {trade.sellerName}</span>
                  </div>
                  <div className="border-l pl-3 border-slate-100">
                    <span className="text-teal-700 font-bold block uppercase text-[10px]">Artículo ofrecido</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{trade.offeredItem}</span>
                    <span className="text-teal-600 font-bold text-[11px]">${trade.offeredValue.toLocaleString()} MXN</span>
                  </div>
                </div>

                {/* Message */}
                {trade.message && (
                  <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-100 italic mb-3">
                    "{trade.message}"
                  </p>
                )}

                {/* Actions if pending */}
                {trade.status === "pending" && trade.sellerId === ApiService.session()?.user.id && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateStatus(trade.id, "rejected")}
                      className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors focus:ring-2 focus:ring-rose-400 outline-none"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(trade.id, "accepted")}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm focus:ring-2 focus:ring-teal-700 outline-none"
                    >
                      Aceptar Trueque
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
