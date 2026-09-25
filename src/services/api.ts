import { Product, TradeProposal, Bid, User, AuctionItem } from "../types";

const LOCAL_STORAGE_KEY_PRODUCTS = "truec_products_v1";
const LOCAL_STORAGE_KEY_TRADES = "truec_trades_v1";
const LOCAL_STORAGE_KEY_BIDS = "truec_bids_v1";
const LOCAL_STORAGE_KEY_FAVORITES = "truec_favorites_v1";
const LOCAL_STORAGE_KEY_USERS = "truec_users_v1";
const LOCAL_STORAGE_KEY_AUCTIONS = "truec_auctions_v1";

export const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_AUCTIONS: AuctionItem[] = [
  {
    id: 1,
    name: "PlayStation 5 Digital Edition",
    startingPrice: 3500,
    img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&auto=format",
    description: "Consola en subasta en vivo. Estado excelente.",
    seller: "Carlos M."
  },
  {
    id: 2,
    name: "MacBook Air M2 256GB",
    startingPrice: 9500,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&auto=format",
    description: "Laptop Apple color Gris Espacial en impecable estado.",
    seller: "Sofía R."
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "PlayStation 5 Digital Edition",
    price: 8500,
    condition: "Excelente estado",
    category: "Consolas",
    acceptsBarter: true,
    img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop&auto=format",
    description: "Consola cuidada y completamente funcional. Incluye un control DualSense original, cables HDMI de alta velocidad y alimentación. Sin detalles estéticos ni de sobrecalentamiento. Lista para entrega en Guadalajara.",
    seller: { name: "Carlos M.", verified: true, rating: 4.8, sales: 48 },
    specs: [
      ["Almacenamiento", "825 GB SSD NVMe"],
      ["Resolución", "Hasta 4K @ 120fps / HDR"],
      ["Audio", "Tempest 3D AudioTech"],
      ["Incluye", "Control DualSense + cables originales"]
    ]
  },
  {
    id: 2,
    name: "MacBook Air M2 (16GB RAM / 512GB)",
    price: 19900,
    condition: "Como nuevo",
    category: "Laptops",
    acceptsBarter: false,
    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop&auto=format",
    description: "MacBook Air en color Medianoche con solo 42 ciclos de batería (salud al 99%). Teclado en español, cargador MagSafe de 35W original y caja intacta. Ideal para desarrollo y diseño.",
    seller: { name: "Valeria R.", verified: true, rating: 5.0, sales: 19 },
    specs: [
      ["Chip", "Apple M2 (8 núcleos CPU, 10 GPU)"],
      ["Memoria", "16 GB unificada"],
      ["Pantalla", "13.6 pulgadas Liquid Retina"],
      ["Batería", "Hasta 18 horas de autonomía"]
    ]
  },
  {
    id: 3,
    name: "iPhone 14 Pro Max 256GB Deep Purple",
    price: 14200,
    condition: "Seminuevo",
    category: "Celulares",
    acceptsBarter: true,
    img: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=600&h=600&fit=crop&auto=format",
    description: "Libre de fábrica para cualquier compañía telefónica. Estética 9.5/10, batería al 89%. Pantalla sin rayones gracias a mica de cristal templado desde el primer día.",
    seller: { name: "Rodrigo T.", verified: true, rating: 4.7, sales: 31 },
    specs: [
      ["Pantalla", "6.7\" Super Retina XDR ProMotion"],
      ["Cámara", "48 MP principal + teleobjetivo 3x"],
      ["Chip", "A16 Bionic"],
      ["Seguridad", "Face ID y Dynamic Island"]
    ]
  },
  {
    id: 4,
    name: "Nintendo Switch OLED Blanco",
    price: 5800,
    condition: "Buen estado",
    category: "Consolas",
    acceptsBarter: true,
    img: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600&h=600&fit=crop&auto=format",
    description: "Consola con pantalla OLED de 7 pulgadas en perfecto estado. Joy-Cons sin drift. Incluye base con puerto LAN, correas, adaptador AC y estuche rígido de viaje.",
    seller: { name: "Mateo L.", verified: false, rating: 4.6, sales: 14 },
    specs: [
      ["Pantalla", "7.0 pulgadas OLED táctil capacitiva"],
      ["Almacenamiento", "64 GB interno + microSD 128GB"],
      ["Modos", "Televisor, sobremesa y portátil"],
      ["Batería", "Aprox. 4.5 a 9 horas"]
    ]
  },
  {
    id: 5,
    name: "Samsung Galaxy S23 Ultra 512GB",
    price: 11500,
    condition: "Como nuevo",
    category: "Celulares",
    acceptsBarter: false,
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop&auto=format",
    description: "Color Phantom Black, incluye S-Pen integrado. Cámara de 200MP con Space Zoom 100x. Se entrega con funda Spigen de uso rudo y cable de carga rápida.",
    seller: { name: "Andrea G.", verified: true, rating: 4.9, sales: 52 },
    specs: [
      ["Cámara", "200 MP + Gran angular + 2 Teleobjetivos"],
      ["Procesador", "Snapdragon 8 Gen 2 for Galaxy"],
      ["Pantalla", "6.8\" Dynamic AMOLED 2X 120Hz"],
      ["Stylus", "S Pen con latencia de 2.8ms"]
    ]
  }
];

const DEFAULT_TRADES: TradeProposal[] = [
  {
    id: 1727000000001,
    wantedProductId: 1,
    wantedProductName: "PlayStation 5 Digital Edition",
    offeredItem: "iPhone 12 Pro 128GB",
    offeredValue: 7200,
    message: "Hola Carlos, mi iPhone está en excelente condición estética con caja original y funda oficial. ¿Aceptarías el intercambio con $1,000 MXN a tu favor?",
    senderName: "Sergio Mendoza",
    sellerName: "Carlos M.",
    status: "pending",
    createdAt: "2026-09-23T14:30:00.000Z"
  }
];

const DEFAULT_BIDS: Bid[] = [
  { id: 1, auctionId: 1, user: "carlos_mx", amount: 3500, time: "Hace 12 seg", avatar: "CM", createdAt: "2026-09-23T16:50:00.000Z" },
  { id: 2, auctionId: 1, user: "techfan99", amount: 3300, time: "Hace 1 min", avatar: "TF", createdAt: "2026-09-23T16:48:00.000Z" },
  { id: 3, auctionId: 1, user: "gamer_pro", amount: 3100, time: "Hace 3 min", avatar: "GP", createdAt: "2026-09-23T16:45:00.000Z" }
];

export class ApiService {
  private static isApiAvailable: boolean | null = null;

  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch("/api/health", { method: "GET", signal: AbortSignal.timeout(1500) });
      this.isApiAvailable = res.ok;
      return res.ok;
    } catch {
      this.isApiAvailable = false;
      return false;
    }
  }

  public static getMode(): "online" | "local" {
    return this.isApiAvailable === true ? "online" : "local";
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. AUTENTICACIÓN (LOGIN & REGISTRO CON VALIDACIÓN DE '@' Y EXCEPCIONES)
  // ───────────────────────────────────────────────────────────────────────────

  // Login con validación y excepciones
  public static async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const trimmedEmail = email?.trim() || "";

    // Validación estricta con excepciones locales antes de enviar
    if (!trimmedEmail) {
      throw new Error("Excepción: El correo electrónico no puede estar vacío.");
    }
    if (!trimmedEmail.includes("@")) {
      throw new Error("Excepción: El correo debe incluir el caracter '@' (ej. usuario@dominio.com).");
    }
    if (!EMAIL_VALIDATION_REGEX.test(trimmedEmail)) {
      throw new Error("Excepción: Formato de correo inválido. Asegúrate de incluir dominio (ej. .com, .app).");
    }
    if (!pass || !pass.trim()) {
      throw new Error("Excepción: La contraseña es obligatoria.");
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: pass }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Excepción de autenticación: Credenciales inválidas");
      }
      this.isApiAvailable = true;
      return data;
    } catch (e: any) {
      // Fallback offline resiliente para demostraciones
      if (trimmedEmail.toLowerCase() === "demo@truec.app" && pass === "demo123") {
        this.isApiAvailable = false;
        return {
          user: {
            id: 1,
            name: "Sergio Mendoza",
            email: "demo@truec.app",
            rating: 4.9,
            reviews: 12,
            trades: 7,
            publications: 3
          },
          token: "local-demo-token"
        };
      }
      throw new Error(e.message || "Excepción de conexión: No se pudo conectar con el servidor.");
    }
  }

  // Registro de nuevo usuario con excepciones
  public static async register(name: string, email: string, pass: string): Promise<{ user: User; token: string }> {
    const trimmedName = name?.trim() || "";
    const trimmedEmail = email?.trim() || "";

    if (!trimmedName || trimmedName.length < 3) {
      throw new Error("Excepción: El nombre completo debe tener al menos 3 caracteres.");
    }
    if (!trimmedEmail.includes("@")) {
      throw new Error("Excepción: El correo debe contener '@' (ej. usuario@dominio.com).");
    }
    if (!EMAIL_VALIDATION_REGEX.test(trimmedEmail)) {
      throw new Error("Excepción: Formato de correo electrónico inválido.");
    }
    if (!pass || pass.length < 6) {
      throw new Error("Excepción: La contraseña debe tener al menos 6 caracteres.");
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: pass }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Excepción al registrar usuario");
      }
      this.isApiAvailable = true;
      return data;
    } catch (e: any) {
      // Fallback de registro en almacenamiento local
      this.isApiAvailable = false;
      const newUser: User = {
        id: Date.now(),
        name: trimmedName,
        email: trimmedEmail,
        rating: 5.0,
        reviews: 0,
        trades: 0,
        publications: 0
      };
      localStorage.setItem("truec-session", JSON.stringify({ user: newUser, token: `local-token-${newUser.id}` }));
      return { user: newUser, token: `local-token-${newUser.id}` };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CRUD DE PRODUCTOS (CREATE, READ, UPDATE, DELETE)
  // ───────────────────────────────────────────────────────────────────────────

  // READ: Obtener Productos
  public static async getProducts(category = "Todos", search = ""): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== "Todos") params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/products?${params.toString()}`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error("Error al consultar productos");
      const data = await res.json();
      this.isApiAvailable = true;
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(data.products));
      return data.products;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      let list: Product[] = raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
      if (category && category !== "Todos") {
        list = list.filter((p) => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return list;
    }
  }

  // CREATE: Publicar Producto
  public static async createProduct(productData: Partial<Product>): Promise<Product> {
    if (!productData.name || !productData.name.trim()) {
      throw new Error("Excepción: El nombre del producto es obligatorio.");
    }
    const priceNum = Number(productData.price);
    if (!productData.price || isNaN(priceNum) || priceNum <= 0) {
      throw new Error("Excepción: El precio debe ser mayor a $0 MXN.");
    }

    let currentUserName = "Sergio Mendoza";
    try {
      const sess = localStorage.getItem("truec-session");
      if (sess) {
        const u = JSON.parse(sess).user;
        if (u?.name) currentUserName = u.name;
      }
    } catch {}

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, sellerName: currentUserName }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar producto");
      this.isApiAvailable = true;
      return data.product;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      const list: Product[] = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];
      const newProduct: Product = {
        id: Date.now(),
        name: productData.name.trim(),
        price: priceNum,
        condition: productData.condition || "Excelente estado",
        category: productData.category || "Celulares",
        acceptsBarter: Boolean(productData.acceptsBarter),
        img: productData.img || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop&auto=format",
        description: productData.description || "Artículo publicado recientemente.",
        seller: { name: currentUserName, verified: true, rating: 4.9, sales: 8 },
        specs: [["Categoría", productData.category || "Tech"], ["Estado", productData.condition || "Excelente"]],
        createdAt: new Date().toISOString()
      };
      list.unshift(newProduct);
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      return newProduct;
    }
  }

  // UPDATE: Actualizar Producto
  public static async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar producto");
      this.isApiAvailable = true;
      return data.product;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      const list: Product[] = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];
      const prod = list.find((p) => p.id === id);
      if (!prod) throw new Error(`Excepción: Producto con ID ${id} no encontrado.`);
      Object.assign(prod, updates);
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(list));
      return prod;
    }
  }

  // DELETE: Eliminar Producto
  public static async deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar producto");
      this.isApiAvailable = true;
    } catch {
      this.isApiAvailable = false;
    }
    // Sincronizar en almacenamiento local siempre
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
    const list: Product[] = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];
    const filtered = list.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
    return true;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. CRUD DE PROPUESTAS DE TRUEQUE
  // ───────────────────────────────────────────────────────────────────────────

  // READ: Obtener Trueques
  public static async getTrades(): Promise<TradeProposal[]> {
    try {
      const res = await fetch("/api/trades", { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error("Error al consultar trueques");
      const data = await res.json();
      this.isApiAvailable = true;
      localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(data.trades));
      return data.trades;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TRADES);
      return raw ? JSON.parse(raw) : DEFAULT_TRADES;
    }
  }

  // CREATE: Crear Propuesta de Trueque
  public static async createTrade(params: {
    wantedProductId: number;
    wantedProductName: string;
    offeredItem: string;
    offeredValue: number;
    message: string;
  }): Promise<TradeProposal> {
    if (!params.wantedProductId) {
      throw new Error("Excepción: Debes seleccionar el producto que deseas recibir.");
    }
    if (!params.offeredItem?.trim()) {
      throw new Error("Excepción: Debes especificar el artículo que ofreces a cambio.");
    }

    try {
      let currentUserName = "Sergio Mendoza";
      try {
        const sess = localStorage.getItem("truec-session");
        if (sess) {
          const u = JSON.parse(sess).user;
          if (u?.name) currentUserName = u.name;
        }
      } catch {}

      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, senderName: currentUserName }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar trueque");
      this.isApiAvailable = true;
      return data.trade;
    } catch {
      this.isApiAvailable = false;
      let currentUserName = "Sergio Mendoza";
      try {
        const sess = localStorage.getItem("truec-session");
        if (sess) {
          const u = JSON.parse(sess).user;
          if (u?.name) currentUserName = u.name;
        }
      } catch {}

      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TRADES);
      const list: TradeProposal[] = raw ? JSON.parse(raw) : [...DEFAULT_TRADES];
      const newTrade: TradeProposal = {
        id: Date.now(),
        wantedProductId: params.wantedProductId,
        wantedProductName: params.wantedProductName,
        offeredItem: params.offeredItem,
        offeredValue: params.offeredValue,
        message: params.message,
        senderName: currentUserName,
        sellerName: "Carlos M.",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      list.unshift(newTrade);
      localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(list));
      return newTrade;
    }
  }

  // UPDATE: Actualizar Estado de Trueque (Aceptar / Rechazar)
  public static async updateTradeStatus(id: number, status: "pending" | "accepted" | "rejected"): Promise<TradeProposal> {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
      this.isApiAvailable = true;
      return data.trade;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TRADES);
      const list: TradeProposal[] = raw ? JSON.parse(raw) : [...DEFAULT_TRADES];
      const item = list.find((t) => t.id === id);
      if (!item) throw new Error(`Excepción: Propuesta con ID ${id} no encontrada.`);
      item.status = status;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(list));
      return item;
    }
  }

  // DELETE: Eliminar Propuesta de Trueque
  public static async deleteTrade(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar propuesta");
      this.isApiAvailable = true;
    } catch {
      this.isApiAvailable = false;
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TRADES);
    const list: TradeProposal[] = raw ? JSON.parse(raw) : [...DEFAULT_TRADES];
    const filtered = list.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(filtered));
    return true;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. SUBASTAS Y PUJAS
  // ───────────────────────────────────────────────────────────────────────────

  public static async getAuctions(): Promise<AuctionItem[]> {
    try {
      const res = await fetch("/api/auctions", { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error("Error al consultar subastas");
      const data = await res.json();
      this.isApiAvailable = true;
      localStorage.setItem(LOCAL_STORAGE_KEY_AUCTIONS, JSON.stringify(data.auctions));
      return data.auctions;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUCTIONS);
      return raw ? JSON.parse(raw) : DEFAULT_AUCTIONS;
    }
  }

  public static async createAuction(auctionData: Partial<AuctionItem>): Promise<AuctionItem> {
    if (!auctionData.name || !auctionData.name.trim()) {
      throw new Error("Excepción: El nombre de la subasta es obligatorio.");
    }
    const priceNum = Number(auctionData.startingPrice);
    if (!auctionData.startingPrice || isNaN(priceNum) || priceNum <= 0) {
      throw new Error("Excepción: El precio inicial debe ser mayor a $0 MXN.");
    }

    const newAuction: AuctionItem = {
      id: Date.now(),
      name: auctionData.name.trim(),
      startingPrice: priceNum,
      img: auctionData.img || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop&auto=format",
      description: auctionData.description || "Artículo en subasta activa.",
      seller: "Sergio Mendoza (Tú)",
      createdAt: new Date().toISOString()
    };

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUCTIONS);
    const list: AuctionItem[] = raw ? JSON.parse(raw) : [...DEFAULT_AUCTIONS];
    list.unshift(newAuction);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUCTIONS, JSON.stringify(list));
    return newAuction;
  }

  public static async updateAuction(id: number, updates: Partial<AuctionItem>): Promise<AuctionItem> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUCTIONS);
    const list: AuctionItem[] = raw ? JSON.parse(raw) : [...DEFAULT_AUCTIONS];
    const item = list.find((a) => a.id === id);
    if (!item) throw new Error("Excepción: Subasta no encontrada.");
    Object.assign(item, updates);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUCTIONS, JSON.stringify(list));
    return item;
  }

  public static async deleteAuction(id: number): Promise<boolean> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUCTIONS);
    const list: AuctionItem[] = raw ? JSON.parse(raw) : [...DEFAULT_AUCTIONS];
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUCTIONS, JSON.stringify(filtered));
    return true;
  }

  public static async getAuctionBids(auctionId = 1): Promise<Bid[]> {
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bids`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error("Error al consultar subasta");
      const data = await res.json();
      this.isApiAvailable = true;
      localStorage.setItem(LOCAL_STORAGE_KEY_BIDS, JSON.stringify(data.bids));
      return data.bids;
    } catch {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BIDS);
      return raw ? JSON.parse(raw) : DEFAULT_BIDS;
    }
  }

  public static async placeBid(auctionId: number, amount: number): Promise<Bid> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Excepción: La puja debe ser un monto numérico positivo.");
    }

    try {
      const res = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        signal: AbortSignal.timeout(2500)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar puja");
      this.isApiAvailable = true;
      return data.bid;
    } catch (e: any) {
      this.isApiAvailable = false;
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BIDS);
      const list: Bid[] = raw ? JSON.parse(raw) : [...DEFAULT_BIDS];
      const top = Math.max(0, ...list.map((b) => b.amount));
      if (amount <= top) {
        throw new Error(`Excepción: La puja ($${amount}) debe superar la oferta líder ($${top.toLocaleString()} MXN).`);
      }
      const newBid: Bid = {
        id: Date.now(),
        auctionId,
        user: "Sergio Mendoza (Tú)",
        amount,
        time: "Ahora mismo",
        avatar: "SM",
        createdAt: new Date().toISOString()
      };
      list.unshift(newBid);
      localStorage.setItem(LOCAL_STORAGE_KEY_BIDS, JSON.stringify(list));
      return newBid;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. FAVORITOS & RESET
  // ───────────────────────────────────────────────────────────────────────────

  public static getFavorites(): number[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FAVORITES);
    return raw ? JSON.parse(raw) : [1];
  }

  public static toggleFavorite(productId: number): boolean {
    const favs = this.getFavorites();
    const idx = favs.indexOf(productId);
    let isNowFav = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      isNowFav = false;
    } else {
      favs.push(productId);
      isNowFav = true;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_FAVORITES, JSON.stringify(favs));
    return isNowFav;
  }

  public static async resetDemo(): Promise<void> {
    try {
      await fetch("/api/reset", { method: "POST", signal: AbortSignal.timeout(2000) });
    } catch {
      // Ignorar fallo de red
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRADES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_BIDS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_FAVORITES);
  }
}
