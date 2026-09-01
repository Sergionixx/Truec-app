import { useState, useEffect } from "react";

type NavTab = "inicio" | "trueques" | "subastas" | "perfil";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  teal: "#00897B",
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

// ─── Shared shell ────────────────────────────────────────────────────────────
function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 393,
        height: 852,
        background: C.bg,
        fontFamily: "'Inter', sans-serif",
        color: C.charcoal,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 0 80px rgba(0,0,0,.18)",
        borderRadius: 40,
      }}
    >
      {children}
    </div>
  );
}

// ─── Status bar ─────────────────────────────────────────────────────────────
function StatusBar({ dark = false }: { dark?: boolean }) {
  const txt = dark ? "#fff" : C.charcoal;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "calc(env(safe-area-inset-top, 0px) + 48px) 24px 6px", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: txt }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {[3, 4, 5].map((h) => (
          <div key={h} style={{ width: 4, height: h, background: txt, borderRadius: 2, opacity: 0.85 }} />
        ))}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 2.5C9.3 2.5 10.9 3.2 12.1 4.3L13.5 2.9C11.9 1.4 9.8.5 7.5.5S3.1 1.4 1.5 2.9L2.9 4.3C4.1 3.2 5.7 2.5 7.5 2.5Z" fill={txt} fillOpacity={0.7} />
          <path d="M7.5 5C8.7 5 9.8 5.5 10.6 6.3L12 4.9C10.8 3.8 9.2 3 7.5 3S4.2 3.8 3 4.9L4.4 6.3C5.2 5.5 6.3 5 7.5 5Z" fill={txt} fillOpacity={0.85} />
          <circle cx="7.5" cy="9" r="1.5" fill={txt} />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke={txt} strokeOpacity={0.35} />
          <rect x="2" y="2" width="17" height="8" rx="2" fill={txt} />
          <path d="M23.5 4v4a2 2 0 000-4z" fill={txt} fillOpacity={0.4} />
        </svg>
      </div>
    </div>
  );
}

// ─── Bottom nav ──────────────────────────────────────────────────────────────
function BottomNav({ active, onTab }: { active: NavTab; onTab: (t: NavTab) => void }) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "inicio", label: "Inicio",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><rect x="9" y="14" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" /></svg>,
    },
    {
      id: "trueques", label: "Trueques",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      id: "subastas", label: "Subastas",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
    },
    {
      id: "perfil", label: "Perfil",
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    },
  ];
  return (
    <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", paddingBottom: 12, flexShrink: 0 }}>
      {tabs.map((t) => {
        const sel = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 3, background: "none", border: "none", cursor: "pointer", color: sel ? C.teal : C.muted, transition: "color .2s" }}
          >
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: sel ? 600 : 400 }}>{t.label}</span>
            {sel && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.teal, marginTop: -1 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Login
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPass, setFocusedPass] = useState(false);
  const [error, setError] = useState("");

  async function submitLogin() {
    setError("");
    try {
      const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pass }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      localStorage.setItem("truec-session", JSON.stringify(result));
      onLogin();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión");
    }
  }

  return (
    <MobileShell>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 32px 40px", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 32, marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.navy} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(0,137,123,.3)" }}>
            <svg width="42" height="42" fill="none" viewBox="0 0 44 44">
              <path d="M10 22c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12S10 28.6 10 22z" stroke="#fff" strokeWidth="2" />
              <path d="M16 19l6-4 6 4M16 25l6 4 6-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 14l-4-4M30 14l4-4M14 30l-4 4M30 30l4 4" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: C.charcoal, margin: 0 }}>Truec-app</h1>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 6, textAlign: "center", lineHeight: 1.5 }}>
            Compra, subasta e intercambia tecnología
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: focusedEmail ? C.teal : C.muted, display: "block", marginBottom: 6 }}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedEmail(true)}
              onBlur={() => setFocusedEmail(false)}
              placeholder="tu@correo.com"
              style={{ width: "100%", padding: "14px 16px", border: `2px solid ${focusedEmail ? C.teal : C.border}`, borderRadius: 12, fontSize: 15, background: C.card, color: C.charcoal, outline: "none", transition: "border-color .2s", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: focusedPass ? C.teal : C.muted, display: "block", marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onFocus={() => setFocusedPass(true)}
              onBlur={() => setFocusedPass(false)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "14px 16px", border: `2px solid ${focusedPass ? C.teal : C.border}`, borderRadius: 12, fontSize: 15, background: C.card, color: C.charcoal, outline: "none", transition: "border-color .2s", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <button style={{ background: "none", border: "none", color: C.navy, fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            onClick={submitLogin}
            style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, boxShadow: "0 4px 16px rgba(0,137,123,.35)", letterSpacing: 0.3 }}
          >
            Iniciar Sesión
          </button>
          {error && <div role="alert" style={{ color: C.danger, fontSize: 12, textAlign: "center" }}>{error}</div>}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <span style={{ fontSize: 14, color: C.muted }}>¿Nuevo por aquí?{" "}</span>
          <button style={{ background: "none", border: "none", color: C.teal, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Crear una cuenta nueva
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 12, color: C.muted }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["Google", "Apple"].map((p) => (
            <button key={p} style={{ flex: 1, padding: "12px", border: `1.5px solid ${C.border}`, borderRadius: 12, background: C.card, fontSize: 14, fontWeight: 500, color: C.charcoal, cursor: "pointer" }}>
              {p === "Google" ? "G " : "🍎 "}{p}
            </button>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Home Catalog
// ═══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = [
  { id: 1, name: "PlayStation 5 Digital", price: "$8,500", cond: "Excelente estado", barter: true, img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=300&fit=crop&auto=format", cat: "Consolas" },
  { id: 2, name: "MacBook Air M2", price: "$19,900", cond: "Como nuevo", barter: false, img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop&auto=format", cat: "Laptops" },
  { id: 3, name: "iPhone 14 Pro Max", price: "$14,200", cond: "Seminuevo", barter: true, img: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop&auto=format", cat: "Celulares" },
  { id: 4, name: "Nintendo Switch OLED", price: "$5,800", cond: "Buen estado", barter: true, img: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=300&h=300&fit=crop&auto=format", cat: "Consolas" },
  { id: 5, name: "Samsung Galaxy S23", price: "$11,500", cond: "Como nuevo", barter: false, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop&auto=format", cat: "Celulares" },
  { id: 6, name: "Call of Duty MW3", price: "$950", cond: "Buen estado", barter: true, img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=300&fit=crop&auto=format", cat: "Videojuegos" },
];

const CHIPS = ["Todos", "Celulares", "Laptops", "Consolas", "Videojuegos"];

function HomeScreen({ onProduct, onNav }: { onProduct: () => void; onNav: (t: NavTab) => void }) {
  const [activeChip, setActiveChip] = useState("Todos");
  const filtered = activeChip === "Todos" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeChip);

  return (
    <MobileShell>
      <StatusBar />
      {/* App bar */}
      <div style={{ padding: "8px 16px 12px", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.navy})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>T</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "9px 14px", gap: 8 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke={C.muted} strokeWidth="2" /><path d="M16.5 16.5L21 21" stroke={C.muted} strokeWidth="2" strokeLinecap="round" /></svg>
            <span style={{ color: C.muted, fontSize: 14 }}>Buscar productos, marcas…</span>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 12, background: C.bg, border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M6 12h12M9 18h6" stroke={C.charcoal} strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        {/* Chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 2 }}>
          {CHIPS.map((c) => {
            const sel = activeChip === c;
            return (
              <button
                key={c}
                onClick={() => setActiveChip(c)}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${sel ? C.teal : C.border}`, background: sel ? C.teal : C.card, color: sel ? "#fff" : C.charcoal, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={onProduct}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", textAlign: "left", padding: 0, boxShadow: "0 2px 8px rgba(0,0,0,.06)", transition: "transform .15s" }}
            >
              <div style={{ position: "relative" }}>
                <img src={p.img} alt={p.name} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", background: C.bg }} />
                {p.barter && (
                  <div style={{ position: "absolute", top: 8, left: 8, background: C.teal, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 20, letterSpacing: 0.3 }}>
                    TRUEQUE
                  </div>
                )}
              </div>
              <div style={{ padding: "10px 10px 12px" }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>{p.cat}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, lineHeight: 1.3, marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 6 }}>{p.price}</div>
                <div style={{ display: "inline-block", fontSize: 10, padding: "3px 8px", borderRadius: 20, background: C.tealLight, color: C.tealDark, fontWeight: 500 }}>
                  {p.cond}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="inicio" onTab={onNav} />
    </MobileShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Product Detail
// ═══════════════════════════════════════════════════════════════════════════════
function DetailScreen({ onBack, onTrade, onNav }: { onBack: () => void; onTrade: () => void; onNav: (t: NavTab) => void }) {
  const [liked, setLiked] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = [
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&h=400&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&h=400&fit=crop&auto=format",
  ];

  return (
    <MobileShell>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Nav bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 16px 12px", background: "transparent", position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 72px)", left: 0, right: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke={C.charcoal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={() => setLiked(!liked)} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
            <svg width="20" height="20" fill={liked ? C.danger : "none"} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.07 6.07 0 0116.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={liked ? C.danger : C.charcoal} strokeWidth="1.8" /></svg>
          </button>
        </div>

        {/* Image carousel */}
        <div style={{ position: "relative", height: 280, overflow: "hidden", background: "#E8EEF5" }}>
          <img src={imgs[imgIdx]} alt="PlayStation 5" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? C.teal : "rgba(255,255,255,.7)", border: "none", cursor: "pointer", transition: "all .2s" }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 20px 176px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>CONSOLAS</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.charcoal, margin: 0, lineHeight: 1.2 }}>PlayStation 5 Digital Edition</h2>
            </div>
            <div style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: C.amberLight, color: C.amber, fontWeight: 700, border: `1px solid ${C.amber}`, whiteSpace: "nowrap" }}>SEMINUEVO</div>
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: C.teal, marginBottom: 16 }}>$8,500 <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>MXN</span></div>

          {/* Seller card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format" alt="Vendedor" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", background: C.bg }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.charcoal }}>Carlos M.</div>
              <div style={{ fontSize: 12, color: C.muted }}>Vendedor verificado · 48 ventas</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {"★★★★★".split("").map((s, i) => <span key={i} style={{ fontSize: 13, color: i < 5 ? C.amber : C.border }}>★</span>)}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>4.8 / 5.0</div>
            </div>
          </div>

          {/* Specs */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>Especificaciones</h3>
            {[
              ["Almacenamiento", "825 GB SSD personalizado"],
              ["Procesador", "AMD Zen 2 a 3.5 GHz"],
              ["Resolución", "Hasta 4K 120fps"],
              ["Conectividad", "Wi-Fi 6, Bluetooth 5.1"],
              ["Incluye", "Control DualSense + cables"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 13, color: C.charcoal, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div style={{ position: "absolute", bottom: 66, left: 0, right: 0, background: C.card, padding: "12px 16px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, boxShadow: "0 -4px 20px rgba(0,0,0,.08)" }}>
        <button style={{ flex: 1, padding: "14px", background: C.navy, color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Comprar ahora
        </button>
        <button onClick={onTrade} style={{ flex: 1, padding: "14px", background: C.teal, color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Proponer Trueque
        </button>
      </div>
      <BottomNav active="inicio" onTab={onNav} />
    </MobileShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Trade Proposal
// ═══════════════════════════════════════════════════════════════════════════════
function TradeScreen({ onBack, onNav }: { onBack: () => void; onNav: (t: NavTab) => void }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [error, setError] = useState("");

  const myItems = [
    { name: "iPhone 12 Pro", img: "https://images.unsplash.com/photo-1605457867610-e990b283f7b0?w=120&h=120&fit=crop&auto=format", val: "$7,200 MXN" },
    { name: "AirPods Pro 2", img: "https://images.unsplash.com/photo-1588423771073-b8903fead714?w=120&h=120&fit=crop&auto=format", val: "$3,500 MXN" },
    { name: "iPad Air 5", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=120&h=120&fit=crop&auto=format", val: "$9,800 MXN" },
  ];

  async function sendTrade() {
    setError("");
    try {
      const response = await fetch("/api/trades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wantedProductId: 1, offeredItem: myItems[selectedItem].name, message: msg }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible enviar la propuesta");
    }
  }

  return (
    <MobileShell>
      <StatusBar />
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 16px 14px", gap: 12, background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke={C.charcoal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, margin: 0 }}>Proponer Intercambio</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
        {/* Target product */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5, marginBottom: 10 }}>PRODUCTO QUE QUIERES RECIBIR</div>
          <div style={{ background: C.card, border: `1.5px solid ${C.teal}`, borderRadius: 16, padding: 14, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 2px 12px rgba(0,137,123,.12)" }}>
            <img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=120&h=120&fit=crop&auto=format" alt="PS5" style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", background: C.bg }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>PlayStation 5 Digital</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>$8,500 <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>MXN</span></div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>de Carlos M. ★ 4.8</div>
            </div>
          </div>
        </div>

        {/* Exchange arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* My items selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5, marginBottom: 10 }}>ELIGE UN PRODUCTO DE TU INVENTARIO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myItems.map((item, i) => {
              const sel = selectedItem === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedItem(i)}
                  style={{ display: "flex", gap: 14, alignItems: "center", padding: 12, background: sel ? C.tealLight : C.card, border: `1.5px solid ${sel ? C.teal : C.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all .2s" }}
                >
                  <img src={item.img} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", background: C.bg }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: sel ? C.tealDark : C.muted, fontWeight: 500, marginTop: 2 }}>{item.val}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? C.teal : C.border}`, background: sel ? C.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>MENSAJE O CONDICIONES DE LA PROPUESTA</label>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Hola, me interesa hacer el intercambio. Mi iPhone 12 Pro está en perfecto estado, con caja original y 2 forros extras. ¿Qué te parece el trato?"
            rows={4}
            style={{ width: "100%", padding: "14px 16px", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.charcoal, resize: "none", outline: "none", background: C.card, lineHeight: 1.5, boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* CTA */}
        <button
          onClick={sendTrade}
          style={{ width: "100%", padding: "16px", background: sent ? "#22C55E" : `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,137,123,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {sent ? (
            <>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ¡Propuesta Enviada!
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Enviar Propuesta de Trueque
            </>
          )}
        </button>
        {error && <div role="alert" style={{ color: C.danger, fontSize: 12, textAlign: "center", marginTop: 8 }}>{error}</div>}
      </div>
      <BottomNav active="trueques" onTab={onNav} />
    </MobileShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Live Auction
// ═══════════════════════════════════════════════════════════════════════════════
const BIDS = [
  { user: "carlos_mx", amount: "$3,500", time: "Hace 12 seg", avatar: "CM" },
  { user: "techfan99", amount: "$3,300", time: "Hace 1 min", avatar: "TF" },
  { user: "gamer_pro", amount: "$3,100", time: "Hace 3 min", avatar: "GP" },
  { user: "electro_daniel", amount: "$2,900", time: "Hace 5 min", avatar: "ED" },
  { user: "mx_deals", amount: "$2,700", time: "Hace 8 min", avatar: "MD" },
];

function AuctionScreen({ onNav }: { onNav: (t: NavTab) => void }) {
  const [time, setTime] = useState(5140); // 01:25:40
  const [customBid, setCustomBid] = useState("3600");
  const [bids, setBids] = useState(BIDS);

  useEffect(() => {
    const t = setInterval(() => setTime((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(time / 3600)).padStart(2, "0");
  const mm = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  async function placeBid(amt: number) {
    const response = await fetch("/api/auctions/1/bids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) });
    const result = await response.json();
    if (!response.ok) return window.alert(result.error);
    const newBid = { user: result.bid.user, amount: `$${result.bid.amount.toLocaleString()}`, time: "Ahora", avatar: "YO" };
    setBids([newBid, ...bids]);
    setCustomBid(String(amt + 100));
  }

  const currentTop = parseInt(bids[0].amount.replace(/\$|,/g, ""), 10);

  return (
    <MobileShell>
      <StatusBar />
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "4px 16px 14px", gap: 12, background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, margin: 0 }}>Subasta Activa</h2>
          <div style={{ fontSize: 12, color: C.teal, fontWeight: 500 }}>PlayStation 5 Digital Edition</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>EN VIVO</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Banner */}
        <div style={{ position: "relative", height: 180, background: "#0F172A", overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=300&fit=crop&auto=format" alt="PS5" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
          {/* Countdown overlay */}
          <div style={{ position: "absolute", bottom: 16, right: 16, background: C.amber, borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 16px rgba(245,158,11,.4)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", letterSpacing: 0.5, marginBottom: 2 }}>TERMINA EN</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1C1917", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>{hh}:{mm}:{ss}</div>
          </div>
          <div style={{ position: "absolute", top: 16, left: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>23 participantes activos</div>
          </div>
        </div>

        {/* Top bid headline */}
        <div style={{ padding: "20px 20px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 4 }}>Puja actual más alta</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.charcoal }}>
            ${currentTop.toLocaleString()} <span style={{ fontSize: 14, color: C.muted, fontWeight: 400 }}>MXN</span>
          </div>
          <div style={{ fontSize: 12, color: C.teal, fontWeight: 500, marginTop: 4 }}>por {bids[0].user}</div>
        </div>

        {/* Bids list */}
        <div style={{ padding: "16px 16px 100px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.5, marginBottom: 12 }}>HISTORIAL DE PUJAS</div>
          {bids.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? C.teal : C.bg, border: `1.5px solid ${i === 0 ? C.teal : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#fff" : C.muted }}>{b.avatar}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal }}>{b.user}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{b.time}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? C.teal : C.charcoal }}>{b.amount}</div>
                {i === 0 && <div style={{ fontSize: 9, color: C.teal, fontWeight: 600 }}>LÍDER</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bid bar */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "12px 16px 20px", flexShrink: 0, boxShadow: "0 -4px 20px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[50, 100, 200].map((inc) => (
            <button
              key={inc}
              onClick={() => setCustomBid(String(currentTop + inc))}
              style={{ flex: 1, padding: "8px 4px", background: C.navyLight, border: `1.5px solid ${C.navy}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.navy, cursor: "pointer" }}
            >
              +${inc}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.bg }}>
            <span style={{ padding: "0 10px", color: C.muted, fontSize: 15, fontWeight: 500 }}>$</span>
            <input
              type="number"
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              style={{ flex: 1, padding: "12px 8px 12px 0", border: "none", background: "transparent", fontSize: 15, fontWeight: 600, color: C.charcoal, outline: "none" }}
            />
            <span style={{ padding: "0 10px", color: C.muted, fontSize: 12 }}>MXN</span>
          </div>
          <button
            onClick={() => placeBid(parseInt(customBid))}
            style={{ padding: "0 16px", background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(0,137,123,.3)" }}
          >
            Confirmar Puja
          </button>
        </div>
      </div>
      <BottomNav active="subastas" onTab={onNav} />
    </MobileShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — five separate mobile frames
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const goTo = (frame: string) => document.getElementById(frame)?.scrollIntoView({ behavior: "smooth", block: "center" });
  const handleNav = (tab: NavTab) => {
    const frameByTab: Record<NavTab, string> = { inicio: "02_Home_Catalog", trueques: "04_Trade_Proposal", subastas: "05_Live_Auction", perfil: "01_Login" };
    goTo(frameByTab[tab]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", flexWrap: "nowrap", alignItems: "flex-start", gap: 40, padding: "32px 24px 48px", overflowX: "auto", fontFamily: "'Inter', sans-serif" }}>
      <div id="01_Login" style={{ width: 393, flex: "0 0 393px" }}><LoginScreen onLogin={() => goTo("02_Home_Catalog")} /></div>
      <div id="02_Home_Catalog" style={{ width: 393, flex: "0 0 393px" }}><HomeScreen onProduct={() => goTo("03_Product_Detail")} onNav={handleNav} /></div>
      <div id="03_Product_Detail" style={{ width: 393, flex: "0 0 393px" }}><DetailScreen onBack={() => goTo("02_Home_Catalog")} onTrade={() => goTo("04_Trade_Proposal")} onNav={handleNav} /></div>
      <div id="04_Trade_Proposal" style={{ width: 393, flex: "0 0 393px" }}><TradeScreen onBack={() => goTo("03_Product_Detail")} onNav={handleNav} /></div>
      <div id="05_Live_Auction" style={{ width: 393, flex: "0 0 393px" }}><AuctionScreen onNav={handleNav} /></div>
    </div>
  );
}
