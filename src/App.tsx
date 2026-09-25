import { useModalFocus } from "./components/useModalFocus";
import React, { useState, useEffect, useId } from "react";
import { NavTab, ViewMode, Product, ToastNotification, User, AuctionItem } from "./types";
import { ApiService } from "./services/api";
import { ToastContainer } from "./components/Toast";
import { PublishProductModal } from "./components/PublishProductModal";
import { TradesManagerModal } from "./components/TradesManagerModal";
import { PlayStoreModal } from "./components/PlayStoreModal";
import { EvaluatorGuideModal } from "./components/EvaluatorGuideModal";
import { DeviceToolbar } from "./components/DeviceToolbar";

// ─── Color Tokens ────────────────────────────────────────────────────────────
const C = {
  teal: "#00796B",
  tealLight: "#E0F2F1",
  tealDark: "#00695C",
  navy: "#1E3A8A",
  navyLight: "#EFF6FF",
  amber: "#F59E0B",
  amberLight: "#FFFBEB",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  charcoal: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  danger: "#EF4444",
};

// ─── Shared Mobile Shell ─────────────────────────────────────────────────────
function DeviceFrame({
  children,
  viewMode,
}: {
  children: React.ReactNode;
  viewMode: ViewMode;
}) {
  if (viewMode === "fullscreen") {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex justify-center">
        <main className="w-full max-w-2xl min-h-screen bg-white shadow-xl flex flex-col relative border-x border-slate-200" role="main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden bg-slate-50 transition-all duration-300"
      style={{
        width: "min(393px, 100vw)",
        height: "max(740px, calc(100dvh - 110px))",
        borderRadius: 44,
        boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3), 0 0 0 10px #1e293b",
      }}
    >
      {children}
    </div>
  );
}

// ─── Bottom Navigation ───────────────────────────────────────────────────────
function BottomNav({
  active,
  onTab,
  unreadTrades = 0,
}: {
  active: NavTab;
  onTab: (t: NavTab) => void;
  unreadTrades?: number;
}) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "inicio",
      label: "Inicio",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        </svg>
      ),
    },
    {
      id: "trueques",
      label: "Trueques",
      badge: unreadTrades,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16" />
        </svg>
      ),
    },
    {
      id: "subastas",
      label: "Subastas",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="8" r="4" strokeWidth="1.8" />
          <path strokeLinecap="round" strokeWidth="1.8" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="bg-white border-t border-slate-200 flex items-center justify-around py-2 px-3 flex-shrink-0 z-20 shadow-md"
      aria-label="Navegación principal de la aplicación"
    >
      {tabs.map((t) => {
        const isSel = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl relative transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
              isSel ? "text-teal-700 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
            aria-selected={isSel}
            role="tab"
            aria-label={`Ir a pestaña ${t.label}`}
          >
            <div className="relative">
              {t.icon}
              {Boolean(t.badge && t.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {t.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{t.label}</span>
            {isSel && <div className="w-1 h-1 rounded-full bg-teal-600 mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Login
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@truec.app");
  const [pass, setPass] = useState("demo123");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameId = useId();
  const emailId = useId();
  const passId = useId();
  const confirmPassId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Excepción de Validación de Correo con '@'
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Excepción de validación: El campo de correo electrónico es obligatorio.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Excepción de validación: El correo debe incluir obligatoriamente el carácter '@' (ej. usuario@dominio.com).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Excepción de formato: El correo electrónico debe tener un dominio válido (ej. usuario@dominio.com).");
      return;
    }

    // 2. Excepción de Validación de Contraseña
    if (!pass || pass.length < 6) {
      setError("Excepción de seguridad: La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }

    // 3. Excepción de Confirmación en Registro
    if (isRegistering) {
      if (!name.trim() || name.trim().length < 3) {
        setError("Excepción de validación: El nombre debe tener al menos 3 caracteres.");
        return;
      }
      if (pass !== confirmPass) {
        setError("Excepción: Las contraseñas ingresadas no coinciden.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const res = await ApiService.register(name.trim(), trimmedEmail, pass);
        localStorage.setItem("truec-session", JSON.stringify(res));
        onLoginSuccess(res.user);
      } else {
        const res = await ApiService.login(trimmedEmail, pass);
        localStorage.setItem("truec-session", JSON.stringify(res));
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || "Excepción de autenticación: Verifique sus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setIsRegistering(false);
    setEmail("demo@truec.app");
    setPass("demo123");
    setError("");
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-gradient-to-b from-white via-teal-50/20 to-slate-50">
      <div className="my-auto py-4">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-700 via-teal-600 to-navy-900 flex items-center justify-center shadow-lg shadow-teal-700/25 mb-3 p-0.5">
            <div className="w-full h-full rounded-[22px] bg-gradient-to-tr from-teal-600 to-teal-800 flex items-center justify-center text-white text-2xl font-black">
              T
            </div>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Truec-app</h1>
          <p className="text-xs text-slate-500 mt-0.5 text-center font-medium">
            Autenticación segura para compra, subasta y trueque
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegistering}
            onClick={() => { setIsRegistering(false); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isRegistering ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegistering}
            onClick={() => { setIsRegistering(true); setError(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isRegistering ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-3.5">
          {isRegistering && (
            <div>
              <label htmlFor={nameId} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label htmlFor={emailId} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico (Debe incluir '@') *
            </label>
            <input
              id={emailId}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={passId} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Contraseña (Mín. 6 caracteres) *
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  className="text-[10px] text-teal-700 font-semibold hover:underline"
                  onClick={() => setError("Para la evaluación académica utiliza la contraseña demo: demo123")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <input
              id={passId}
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor={confirmPassId} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmar Contraseña *
              </label>
              <input
                id={confirmPassId}
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
              />
            </div>
          )}

          {/* Banner de Excepciones y Errores */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-semibold text-rose-700 leading-tight"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-700 outline-none disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </span>
            ) : isRegistering ? (
              "Registrar Cuenta"
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* Demo Fast Access */}
        {!isRegistering && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={fillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold hover:bg-teal-100 transition-colors"
            >
              <span>Autocompletar cuenta demo (demo@truec.app)</span>
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-400 py-1">
        <span>Evaluación Académica · Truec-app 2026</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Catalog Home (No favorites/stars on product cards)
// ═══════════════════════════════════════════════════════════════════════════════
function HomeScreen({
  currentUser,
  onSelectProduct,
  onOpenPublish,
  onTab,
  showToast,
}: {
  currentUser: User | null;
  onSelectProduct: (p: Product) => void;
  onOpenPublish: () => void;
  onTab: (t: NavTab) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyBarter, setOnlyBarter] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ["Todos", "Celulares", "Laptops", "Consolas", "Audio", "Videojuegos"];
  const conditions = ["Todas", "Excelente estado", "Como nuevo", "Seminuevo", "Buen estado"];

  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts(activeCategory, searchQuery);
      setProducts(data);
    } catch {
      showToast("Error al cargar catálogo", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado reactivo en cliente (categoría, búsqueda, trueque, precio y condición)
  const filteredProducts = products.filter((p) => {
    if (onlyBarter && !p.acceptsBarter) return false;
    if (selectedCondition !== "Todas" && p.condition !== selectedCondition) return false;
    if (maxPrice > 0 && p.price > maxPrice) return false;
    return true;
  });

  const activeFiltersCount = (onlyBarter ? 1 : 0) + (selectedCondition !== "Todas" ? 1 : 0) + (maxPrice > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setActiveCategory("Todos");
    setSearchQuery("");
    setOnlyBarter(false);
    setSelectedCondition("Todas");
    setMaxPrice(0);
  };

  const displayName = currentUser?.name || "Sergio";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header Search Bar & Filter Controls */}
      <div className="px-5 pt-3 pb-3 bg-white border-b border-slate-200/80 flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              {displayName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block leading-tight">Hola, {displayName}</span>
              <span className="text-sm font-extrabold text-slate-800 leading-tight">Catálogo y Filtros</span>
            </div>
          </div>
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all focus:ring-2 focus:ring-teal-600 outline-none"
            aria-label="Publicar un nuevo producto"
          >
            <span>Publicar</span>
          </button>
        </div>

        {/* Search Input with Filter Toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar PlayStation, MacBook, iPhone..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
              aria-label="Barra de búsqueda reactiva"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center relative transition-all focus:outline-none focus:ring-2 focus:ring-teal-600 ${
              showFilterPanel || activeFiltersCount > 0
                ? "bg-teal-600 border-teal-700 text-white shadow-sm"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="Abrir panel de filtros avanzados"
            title="Filtros avanzados de búsqueda"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Panel Desplegable de Filtros Avanzados */}
        {showFilterPanel && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Filtros Avanzados</span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] text-teal-700 font-bold hover:underline"
              >
                Limpiar todo
              </button>
            </div>

            {/* Filtro: Solo Trueque */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Acepta Trueque únicamente:</span>
              <button
                type="button"
                onClick={() => setOnlyBarter(!onlyBarter)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  onlyBarter ? "bg-teal-600 border-teal-700 text-white" : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                {onlyBarter ? "✓ Solo Trueque" : "Todos los modos"}
              </button>
            </div>

            {/* Filtro: Condición */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">Condición del equipo:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {conditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCondition(c)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                      selectedCondition === c
                        ? "bg-slate-800 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro: Precio Máximo */}
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Precio máximo:</span>
                <span className="text-teal-700 font-bold">
                  {maxPrice === 0 ? "Cualquier precio" : `< $${maxPrice.toLocaleString()} MXN`}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[0, 6000, 12000, 20000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMaxPrice(val)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      maxPrice === val
                        ? "bg-teal-600 border-teal-700 text-white"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    {val === 0 ? "Todos" : `< $${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chips Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Categorías de tecnología">
          {categories.map((cat) => {
            const isSel = activeCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSel}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSel ? "bg-teal-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Circular Economy Banner */}
        <div className="bg-teal-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="max-w-full">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest block">Economía Circular</span>
            <h3 className="font-extrabold text-sm mt-0.5">Intercambia, no acumules</h3>
            <p className="text-xs text-teal-100 mt-1">Dale valor a tus equipos en desuso y consigue lo que necesitas sin gastar demás.</p>
          </div>
        </div>

        {/* Section title */}
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {activeCategory} ({filteredProducts.length})
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Productos de ejemplo</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-2">
                <div className="w-full aspect-square bg-slate-200 rounded-xl" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <h4 className="font-bold text-slate-700 text-sm">No encontramos productos con estos filtros</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Prueba cambiando la categoría, limpiando los filtros o publica tú mismo este artículo con el botón superior.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-3 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs rounded-full hover:bg-teal-100"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              return (
                <article
                  key={p.id}
                  role="button" tabIndex={0} aria-label={"Ver " + p.name}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectProduct(p); } }}
                  onClick={() => onSelectProduct(p)}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {p.acceptsBarter && (
                      <span className="absolute top-2 left-2 bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                        TRUEQUE
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 block leading-none">
                          ${p.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">MXN</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {p.condition.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="inicio" onTab={onTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Product Detail (No favorites/stars in top floating bar)
// ═══════════════════════════════════════════════════════════════════════════════
function DetailScreen({
  product,
  onBack,
  onTrade,
  onTab,
  showToast,
  onDeleteProduct,
  onEditProduct,
}: {
  product: Product;
  onBack: () => void;
  onTrade: () => void;
  onTab: (t: NavTab) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  onDeleteProduct?: (id: number) => void;
  onEditProduct?: (product: Product) => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
      {/* Top Floating App Bar */}
      <div className="absolute top-4 inset-x-0 px-4 flex justify-between items-center z-20 pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
          aria-label="Volver al catálogo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable details */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Hero Image */}
        <div className="relative w-full h-72 bg-slate-200">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            1 / 3 Fotos
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">{product.category}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {product.condition}
              </span>
              {product.acceptsBarter && (
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                  Acepta Trueque
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-snug">{product.name}</h1>
            <div className="text-2xl font-black text-teal-700 mt-2">
              ${product.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN estimado</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-black text-sm">
                {product.seller?.name ? product.seller.name.substring(0, 2).toUpperCase() : "VE"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-800">{product.seller?.name || "Vendedor Verificado"}</span>
                  <span className="text-teal-600 text-xs" title="Vendedor verificado">✓</span>
                </div>
                <div className="text-xs text-slate-400">
                  ★ {product.seller?.rating || 4.8} · {product.seller?.sales || 24} intercambios exitosos
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl">Confiable</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Descripción del artículo</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Especificaciones técnicas</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {product.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between p-3">
                    <span className="text-slate-400 font-medium">{k}</span>
                    <span className="font-semibold text-slate-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones de Edición y Eliminación */}
          <div className="pt-2 flex gap-3" style={{ display: ApiService.owns(product) ? undefined : "none" }}>
            <button
              type="button"
              onClick={() => onEditProduct?.(product)}
              className="flex-1 py-3 px-4 rounded-2xl border border-teal-200 bg-teal-50/80 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-400 outline-none"
              title="Editar este producto"
            >
              <span>Editar publicación</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Confirmas que deseas eliminar el producto '${product.name}' del catálogo?`)) {
                  onDeleteProduct?.(product.id);
                }
              }}
              className="flex-1 py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50/80 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-rose-400 outline-none"
              title="Eliminar este producto"
            >
              <span>Eliminar esta publicación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Actions */}
      <div className="absolute bottom-14 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex gap-3 shadow-lg z-20">
        <button
          onClick={() => showToast("En este prototipo académico se prioriza el trueque y subasta.", "info")}
          className="flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-400 outline-none"
        >
          Sobre las compras
        </button>
        <button
          onClick={onTrade}
          className="flex-1 py-3.5 px-4 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-teal-700 outline-none"
        >
          <span>Proponer Trueque</span>
        </button>
      </div>

      <BottomNav active="inicio" onTab={onTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Propose Trade
// ═══════════════════════════════════════════════════════════════════════════════
function TradeScreen({
  targetProduct,
  onBack,
  onTab,
  showToast,
  onOpenTradesManager,
}: {
  targetProduct: Product;
  onBack: () => void;
  onTab: (t: NavTab) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  onOpenTradesManager: () => void;
}) {
  const inventory = [
    { name: "iPhone 12 Pro 128GB", val: 7200, img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&auto=format" },
    { name: "AirPods Pro 2da Generación", val: 3500, img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop&auto=format" },
    { name: "iPad Air 5 M1 Wi-Fi 64GB", val: 9800, img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop&auto=format" },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useModalFocus(showConfirm, () => setShowConfirm(false));

  const handleSendTrade = async () => {
    setSubmitting(true);
    try {
      const offered = inventory[selectedIdx];
      await ApiService.createTrade({
        wantedProductId: targetProduct.id,
        wantedProductName: targetProduct.name,
        offeredItem: offered.name,
        offeredValue: offered.val,
        message: message.trim() || "Hola, me interesa realizar el trueque por este artículo. Quedo atento a tu respuesta.",
      });

      showToast("¡Propuesta de trueque enviada exitosamente!", "success");
      setShowConfirm(false);
      onOpenTradesManager();
    } catch (err: any) {
      showToast(err.message || "Error al enviar la propuesta", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Top App Bar */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
            aria-label="Volver atrás"
          >
            ←
          </button>
          <h2 className="font-extrabold text-sm text-slate-800">Proponer Intercambio</h2>
        </div>
        <button
          onClick={onOpenTradesManager}
          className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-200"
        >
          Mis Trueques
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 1: Target Product */}
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block mb-2">
            Paso 1: Producto que recibirás
          </span>
          <div className="flex items-center gap-3">
            <img src={targetProduct.img} alt={targetProduct.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{targetProduct.name}</h4>
              <span className="text-teal-700 font-black text-sm block mt-0.5">${targetProduct.price.toLocaleString()} MXN</span>
              <span className="text-[10px] text-slate-400">Vendedor: {targetProduct.seller?.name || "Carlos M."}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Offered Product */}
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">
            Paso 2: Elige qué artículo ofreces a cambio
          </span>
          <div className="space-y-2" role="radiogroup" aria-label="Inventario personal">
            {inventory.map((item, idx) => {
              const isSel = selectedIdx === idx;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                    isSel ? "bg-teal-50 border-teal-600 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">{item.name}</h5>
                      <span className="text-slate-500 font-semibold text-[11px]">${item.val.toLocaleString()} MXN</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSel ? "border-teal-600 bg-teal-600" : "border-slate-300"}`}>
                    {isSel && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Message */}
        <div>
          <label htmlFor="trade-msg" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1.5 px-1">
            Paso 3: Mensaje o condiciones del trato
          </label>
          <textarea
            id="trade-msg"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hola, me interesa el trueque. Mi equipo tiene caja original y estética de 9.5/10..."
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none resize-none bg-white"
          />
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-700 outline-none"
        >
          <span>Revisar y Enviar Propuesta</span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" ref={confirmRef} role="dialog" aria-label="Confirmar operación" aria-modal="true">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-800">¿Confirmar propuesta de trueque?</h3>
            <p className="text-xs text-slate-600">
              Ofrecerás tu <strong>{inventory[selectedIdx].name}</strong> por el <strong>{targetProduct.name}</strong>. El vendedor podrá consultar la propuesta en su cuenta.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendTrade}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700"
              >
                {submitting ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="trueques" onTab={onTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Live Auction (with full CRUD & image URL)
// ═══════════════════════════════════════════════════════════════════════════════
function AuctionScreen({
  onTab,
  showToast,
}: {
  onTab: (t: NavTab) => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}) {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [clock, setClock] = useState(Date.now());
  const timeSec = Math.max(0, Math.ceil(((Date.parse(selectedAuction?.endsAt || "") || 0) - clock) / 1000));
  const [bidAmount, setBidAmount] = useState("3600");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useModalFocus(showConfirm, () => setShowConfirm(false));

  // Modal for create/edit auction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const auctionRef = useModalFocus(isModalOpen, () => setIsModalOpen(false));
  const [auctionToEdit, setAuctionToEdit] = useState<AuctionItem | null>(null);
  const [name, setName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadAuctions();
    const interval = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAuctions = async () => {
    try {
      const list = await ApiService.getAuctions();
      setAuctions(list);
      const next = list.find(a => a.id === selectedAuction?.id) || list[0] || null;
      setSelectedAuction(next);
      if (next) loadBids(next.id); else setBids([]);
    } catch {
      showToast("Error al cargar subastas", "error");
    }
  };

  const loadBids = async (auctionId: number) => {
    try {
      const data = await ApiService.getAuctionBids(auctionId);
      setBids(data);
      if (data.length > 0) {
        setBidAmount(String(data[0].amount + 100));
      } else {
        const item = auctions.find((a) => a.id === auctionId);
        setBidAmount(String((item?.startingPrice || 3500) + 100));
      }
    } catch {
      showToast("Error al cargar pujas", "error");
    }
  };

  const handleOpenCreate = () => {
    setAuctionToEdit(null);
    setName("");
    setStartingPrice("");
    setImgUrl("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AuctionItem) => {
    setAuctionToEdit(item);
    setName(item.name);
    setStartingPrice(String(item.startingPrice));
    setImgUrl(item.img);
    setDescription(item.description || "");
    setIsModalOpen(true);
  };

  const handleSaveAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startingPrice) {
      showToast("Nombre y precio inicial son obligatorios", "error");
      return;
    }
    try {
      if (auctionToEdit) {
        await ApiService.updateAuction(auctionToEdit.id, {
          name: name.trim(),
          startingPrice: Number(startingPrice),
          img: imgUrl.trim() || auctionToEdit.img,
          description: description.trim(),
        });
        showToast("Subasta actualizada exitosamente", "success");
      } else {
        const created = await ApiService.createAuction({
          name: name.trim(),
          startingPrice: Number(startingPrice),
          img: imgUrl.trim() || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop&auto=format",
          description: description.trim(),
        });
        showToast("¡Subasta creada y publicada con éxito!", "success");
        setSelectedAuction(created);
      }
      setIsModalOpen(false);
      loadAuctions();
    } catch (err: any) {
      showToast(err.message || "Error al guardar subasta", "error");
    }
  };

  const handleDeleteAuction = async (id: number) => {
    if (window.confirm("¿Confirmas que deseas eliminar esta subasta?")) {
      try { await ApiService.deleteAuction(id); showToast("Subasta eliminada", "info"); await loadAuctions(); } catch (err: any) { showToast(err.message, "error"); }
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedAuction || timeSec <= 0) { showToast("La subasta ha terminado.", "error"); return; }
    const num = Number(bidAmount);
    setLoading(true);
    try {
      await ApiService.placeBid(selectedAuction.id, num);
      showToast(`¡Puja registrada exitosamente por $${num.toLocaleString()} MXN!`, "success");
      setShowConfirm(false);
      loadBids(selectedAuction.id);
    } catch (err: any) {
      showToast(err.message || "Error al enviar la puja", "error");
    } finally {
      setLoading(false);
    }
  };

  const topBid = bids[0]?.amount || selectedAuction?.startingPrice || 3500;
  const hours = String(Math.floor(timeSec / 3600)).padStart(2, "0");
  const mins = String(Math.floor((timeSec % 3600) / 60)).padStart(2, "0");
  const secs = String(timeSec % 60).padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-extrabold text-sm text-slate-800">Subastas Activas</h2>
          <span className="text-[11px] text-teal-700 font-semibold">{selectedAuction?.name || "Selecciona una subasta"}</span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm"
        >
          Publicar Subasta
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Auctions Selector / Carousel */}
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">
            Artículos en Subasta ({auctions.length})
          </span>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {auctions.map((a) => {
              const isSel = selectedAuction?.id === a.id;
              return (
                <div
                  key={a.id} role="button" tabIndex={0} aria-label={"Ver subasta " + a.name}
                  onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setSelectedAuction(a); loadBids(a.id); } }}
                  onClick={() => {
                    setSelectedAuction(a);
                    loadBids(a.id);
                  }}
                  className={`flex-shrink-0 w-36 bg-white rounded-2xl p-2.5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSel ? "border-teal-600 shadow-md ring-2 ring-teal-600/20" : "border-slate-200 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={a.img} alt={a.name} className="w-full h-24 rounded-xl object-cover mb-2" />
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{a.name}</h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-teal-700">${a.startingPrice.toLocaleString()}</span>
                    {selectedAuction?.id === a.id && ApiService.owns(a) && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(a); }}
                          className="text-[10px] text-teal-600 hover:underline font-bold"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAuction(a.id); }}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                          title="Eliminar"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedAuction && (
          <>
            {/* Banner with countdown */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md">
              <img
                src={selectedAuction.img}
                alt={selectedAuction.name}
                className="w-full h-44 object-cover opacity-60"
              />
              <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xs">
                Vendedor: {selectedAuction.seller}
              </div>
              <div className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 p-2.5 rounded-2xl shadow-lg text-right font-mono">
                <span className="text-[10px] font-black uppercase tracking-wider block text-amber-950">Termina en</span>
                <span className="text-xl font-black font-mono">
                  {hours}:{mins}:{secs}
                </span>
              </div>
            </div>

            {/* Top Bid Display */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Puja actual más alta</span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ${topBid.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN</span>
              </div>
              <span className="text-xs font-bold text-teal-700 mt-1 inline-block">
                Líder: {bids[0]?.user || "carlos_mx"}
              </span>
            </div>

            {/* Quick Bid Increments */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">
                Incrementos rápidos
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setBidAmount(String(topBid + inc))}
                    className="py-2.5 rounded-xl border border-navy-200 bg-navy-50 text-navy-800 font-bold text-xs hover:bg-navy-100 transition-colors"
                  >
                    +${inc} MXN
                  </button>
                ))}
              </div>
            </div>

            {/* Bid Input and Action */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <label htmlFor="custom-bid" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ingresa tu oferta
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold">$</span>
                  <input
                    id="custom-bid"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-xs font-semibold">MXN</span>
                </div>
                <button
                  disabled={timeSec <= 0 || ApiService.owns(selectedAuction)} onClick={() => setShowConfirm(true)}
                  className="py-2.5 px-5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/30 transition-colors focus:ring-2 focus:ring-teal-700 outline-none"
                >
                  Pujar
                </button>
              </div>
            </div>

            {/* Bids History */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2 px-1">
                Historial de pujas recientes
              </span>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {bids.map((b, idx) => (
                  <div key={b.id || idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {b.avatar || b.user?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{b.user}</span>
                        <span className="text-[10px] text-slate-400">{b.time || "Hace momentos"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black ${idx === 0 ? "text-teal-700 text-sm" : "text-slate-700"}`}>
                        ${b.amount.toLocaleString()} MXN
                      </span>
                      {idx === 0 && <span className="text-[9px] font-bold text-teal-600 block">LÍDER</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for Create/Edit Auction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" ref={auctionRef} role="dialog" aria-label="Confirmar operación" aria-modal="true">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">
              {auctionToEdit ? "Editar Subasta" : "Publicar Nueva Subasta"}
            </h3>
            <form onSubmit={handleSaveAuction} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Nintendo Switch OLED"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Precio inicial ($ MXN) *</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="4500"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">URL de la imagen *</label>
                <input
                  type="url"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-600"
                />
                <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Pega el enlace de una imagen de Unsplash o web</span>
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-600 mb-1">Descripción</label>
                <textarea
                  rows={2} aria-label="Descripción de la subasta"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles del artículo en subasta..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md"
                >
                  {auctionToEdit ? "Guardar Cambios" : "Publicar Subasta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation modal for bidding */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" ref={confirmRef} role="dialog" aria-label="Confirmar operación" aria-modal="true">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-800">¿Confirmar puja de subasta?</h3>
            <p className="text-xs text-slate-600">
              Estás a punto de ofertar <strong>${Number(bidAmount).toLocaleString()} MXN</strong> en {selectedAuction?.name}. Si nadie supera tu oferta, ganarás el artículo.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePlaceBid}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700"
              >
                {loading ? "Enviando..." : "Confirmar Puja"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="subastas" onTab={onTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — User Profile (Dynamic stats, no verified stars badge)
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileScreen({
  currentUser,
  onTab,
  onOpenPublish,
  onOpenTrades,
  onLogout,
}: {
  currentUser: User | null;
  onTab: (t: NavTab) => void;
  onOpenPublish: () => void;
  onOpenTrades: () => void;
  onLogout: () => void;
}) {
  const name = currentUser?.name || "Sergio Mendoza";
  const email = currentUser?.email || "demo@truec.app";
  const initial = name.substring(0, 1).toUpperCase();

  const [pubCount, setPubCount] = useState(3);
  const [tradeCount, setTradeCount] = useState(7);

  useEffect(() => {
    const isDemo = name.toLowerCase().includes("sergio") || email.toLowerCase().includes("demo");
    if (isDemo) {
      setPubCount(3);
      setTradeCount(7);
    } else {
      ApiService.getProducts()
        .then((prods) => {
          const myProds = prods.filter((p) => p.seller?.name === name);
          setPubCount(Math.max(1, myProds.length));
        })
        .catch(() => setPubCount(1));

      ApiService.getTrades()
        .then((trades) => {
          const myTrades = trades.filter((t) => t.senderName === name || t.sellerName === name);
          setTradeCount(Math.max(1, myTrades.length));
        })
        .catch(() => setTradeCount(1));
    }
  }, [name, email]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <h2 className="font-extrabold text-sm text-slate-800">Mi Perfil</h2>
        <button onClick={onLogout} className="text-xs font-bold text-rose-600 hover:underline">
          Cerrar sesión
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-600 to-navy-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-teal-600/20">
            {initial}
          </div>
          <h3 className="font-extrabold text-base text-slate-900 mt-3">{name}</h3>
          <p className="text-xs text-slate-400">{email}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
            <div>
              <span className="font-extrabold text-slate-900 text-base block">{pubCount}</span>
              <span className="text-[10px] text-slate-400 font-semibold">Publicaciones</span>
            </div>
            <div className="border-l border-slate-100">
              <span className="font-extrabold text-teal-700 text-base block">{tradeCount}</span>
              <span className="text-[10px] text-slate-400 font-semibold">Trueques</span>
            </div>
          </div>
        </div>

        {/* Options list */}
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs text-xs font-bold text-slate-700">
          <button
            onClick={onOpenPublish}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span>Publicar nuevo producto</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          <button
            onClick={onOpenTrades}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span>Gestionar mis propuestas de trueque</span>
            </div>
            <span className="text-slate-400">→</span>
          </button>
        </div>
      </div>

      <BottomNav active="perfil" onTab={onTab} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("phone");
  const [activeTab, setActiveTab] = useState<NavTab>("inicio");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tradeTarget, setTradeTarget] = useState<Product | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals state
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isTradesOpen, setIsTradesOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => { const id = setInterval(() => setIsOnline(ApiService.getMode() === "online"), 1000); return () => clearInterval(id); }, []);

  const handleOpenPublish = () => {
    setProductToEdit(null);
    setIsPublishOpen(true);
  };

  const handleProductUpdated = (updatedProd: Product) => {
    setSelectedProduct(updatedProd);
    showToast("Producto actualizado exitosamente", "success");
  };

  useEffect(() => {
    // Check initial health and favorites
    ApiService.checkHealth().then((ok) => setIsOnline(ok));
    setFavorites(ApiService.getFavorites());

    // Check saved session
    const sess = localStorage.getItem("truec-session");
    if (!sess) {
      setIsLoggedIn(false);
      setCurrentUser(null);
    } else {
      try {
        const data = JSON.parse(sess);
        if (data.user) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const showToast = (message: string, type: ToastNotification["type"] = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleToggleFavorite = (id: number) => {
    const isNowFav = ApiService.toggleFavorite(id);
    setFavorites(ApiService.getFavorites());
    showToast(isNowFav ? "Guardado en favoritos" : "Eliminado de favoritos", "info");
  };

  const handleProductCreated = (newProd: Product) => {
    setSelectedProduct(newProd);
    setActiveTab("inicio");
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await ApiService.deleteProduct(id);
      showToast("Producto eliminado exitosamente del catálogo", "info");
      setSelectedProduct(null);
      setActiveTab("inicio");
    } catch (err: any) {
      showToast(err.message || "Error al eliminar producto", "error");
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    showToast(`¡Bienvenido, ${user.name}!`, "success");
  };

  // If in Figma Canvas View Mode: Show 5 frames side by side!
  if (viewMode === "canvas") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <DeviceToolbar
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          isOnline={isOnline}
          onOpenPublish={handleOpenPublish}
          onOpenTrades={() => setIsTradesOpen(true)}
          onOpenPlayStore={() => setIsPlayStoreOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
        <div className="flex-1 p-8 flex gap-8 overflow-x-auto items-start">
          <div className="flex-shrink-0">
            <span className="text-white text-xs font-bold block mb-2">Pantalla 1: Inicio de Sesión</span>
            <DeviceFrame viewMode="phone">
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </DeviceFrame>
          </div>
          <div className="flex-shrink-0">
            <span className="text-white text-xs font-bold block mb-2">Pantalla 2: Catálogo y Filtros</span>
            <DeviceFrame viewMode="phone">
              <HomeScreen
                currentUser={currentUser}
                onSelectProduct={(p) => { setSelectedProduct(p); setViewMode("phone"); }}
                onOpenPublish={handleOpenPublish}
                onTab={setActiveTab}
                showToast={showToast}
              />
            </DeviceFrame>
          </div>
          <div className="flex-shrink-0">
            <span className="text-white text-xs font-bold block mb-2">Pantalla 3: Detalle de Producto</span>
            <DeviceFrame viewMode="phone">
              <DetailScreen
                product={selectedProduct || {
                  id: 1,
                  name: "PlayStation 5 Digital Edition",
                  price: 8500,
                  condition: "Excelente estado",
                  category: "Consolas",
                  acceptsBarter: true,
                  img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&auto=format",
                  description: "Consola cuidada y completamente funcional.",
                  seller: { name: "Carlos M.", verified: true, rating: 4.8, sales: 48 },
                  specs: [["Almacenamiento", "825 GB SSD NVMe"], ["Resolución", "4K HDR"]],
                }}
                onBack={() => {}}
                onTrade={() => setActiveTab("trueques")}
                onTab={setActiveTab}
                showToast={showToast}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={(p) => { setProductToEdit(p); setIsPublishOpen(true); }}
              />
            </DeviceFrame>
          </div>
          <div className="flex-shrink-0">
            <span className="text-white text-xs font-bold block mb-2">Pantalla 4: Proponer Trueque</span>
            <DeviceFrame viewMode="phone">
              <TradeScreen
                targetProduct={tradeTarget || {
                  id: 1,
                  name: "PlayStation 5 Digital Edition",
                  price: 8500,
                  condition: "Excelente estado",
                  category: "Consolas",
                  acceptsBarter: true,
                  img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&auto=format",
                  description: "Consola en perfecto estado.",
                  seller: { name: "Carlos M.", verified: true, rating: 4.8, sales: 48 },
                }}
                onBack={() => {}}
                onTab={setActiveTab}
                showToast={showToast}
                onOpenTradesManager={() => setIsTradesOpen(true)}
              />
            </DeviceFrame>
          </div>
          <div className="flex-shrink-0">
            <span className="text-white text-xs font-bold block mb-2">Pantalla 5: Subasta Activa</span>
            <DeviceFrame viewMode="phone">
              <AuctionScreen onTab={setActiveTab} showToast={showToast} />
            </DeviceFrame>
          </div>
        </div>

        {/* Global Modals */}
        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
        <PublishProductModal
          isOpen={isPublishOpen}
          onClose={() => { setIsPublishOpen(false); setProductToEdit(null); }}
          onCreated={handleProductCreated}
          onUpdated={handleProductUpdated}
          productToEdit={productToEdit}
          showToast={showToast}
        />
        <TradesManagerModal isOpen={isTradesOpen} onClose={() => setIsTradesOpen(false)} showToast={showToast} />
        <PlayStoreModal isOpen={isPlayStoreOpen} onClose={() => setIsPlayStoreOpen(false)} showToast={showToast} />
        <EvaluatorGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          showToast={showToast}
          onOpenPublish={handleOpenPublish}
          onOpenTrades={() => setIsTradesOpen(true)}
          onOpenPlayStore={() => setIsPlayStoreOpen(true)}
        />
      </div>
    );
  }

  // Interactive App Mode (Phone or Fullscreen)
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans select-none sm:select-auto">
      <DeviceToolbar
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        isOnline={isOnline}
        onOpenPublish={handleOpenPublish}
        onOpenTrades={() => setIsTradesOpen(true)}
        onOpenPlayStore={() => setIsPlayStoreOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <div className="flex-1 flex items-center justify-center p-0 sm:p-6 overflow-hidden">
        <DeviceFrame viewMode={viewMode}>
          {!isLoggedIn ? (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          ) : selectedProduct ? (
            <DetailScreen
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onTrade={() => {
                setTradeTarget(selectedProduct); setSelectedProduct(null); setActiveTab("trueques");
              }}
              onTab={(t) => {
                setSelectedProduct(null);
                setActiveTab(t);
              }}
              showToast={showToast}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={(p) => { setProductToEdit(p); setIsPublishOpen(true); }}
            />
          ) : activeTab === "inicio" ? (
            <HomeScreen
              currentUser={currentUser}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onOpenPublish={handleOpenPublish}
              onTab={setActiveTab}
              showToast={showToast}
            />
          ) : activeTab === "trueques" ? (
            <TradeScreen
              targetProduct={tradeTarget || {
                id: 1,
                name: "PlayStation 5 Digital Edition",
                price: 8500,
                condition: "Excelente estado",
                category: "Consolas",
                acceptsBarter: true,
                img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&auto=format",
                description: "Consola cuidada y completamente funcional.",
                seller: { name: "Carlos M.", verified: true, rating: 4.8, sales: 48 },
              }}
              onBack={() => setActiveTab("inicio")}
              onTab={setActiveTab}
              showToast={showToast}
              onOpenTradesManager={() => setIsTradesOpen(true)}
            />
          ) : activeTab === "subastas" ? (
            <AuctionScreen onTab={setActiveTab} showToast={showToast} />
          ) : (
            <ProfileScreen
              currentUser={currentUser}
              onTab={setActiveTab}
              onOpenPublish={handleOpenPublish}
              onOpenTrades={() => setIsTradesOpen(true)}
              onLogout={() => {
                void ApiService.logout().catch(() => {});
                setIsLoggedIn(false);
                setCurrentUser(null);
                showToast("Sesión cerrada correctamente", "info");
              }}
            />
          )}
        </DeviceFrame>
      </div>

      {/* Global Modals & Toasts */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <PublishProductModal
        isOpen={isPublishOpen}
        onClose={() => { setIsPublishOpen(false); setProductToEdit(null); }}
        onCreated={handleProductCreated}
        onUpdated={handleProductUpdated}
        productToEdit={productToEdit}
        showToast={showToast}
      />
      <TradesManagerModal isOpen={isTradesOpen} onClose={() => setIsTradesOpen(false)} showToast={showToast} />
      <PlayStoreModal isOpen={isPlayStoreOpen} onClose={() => setIsPlayStoreOpen(false)} showToast={showToast} />
      <EvaluatorGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        showToast={showToast}
        onOpenPublish={handleOpenPublish}
        onOpenTrades={() => setIsTradesOpen(true)}
        onOpenPlayStore={() => setIsPlayStoreOpen(true)}
      />
    </div>
  );
}
