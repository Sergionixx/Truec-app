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

class HttpError extends Error {}
export class ApiService {
  private static online = false;
  public static getMode(): "online" | "local" { return this.online ? "online" : "local"; }
  public static session(): { user: User; token: string } | null {
    try { return JSON.parse(localStorage.getItem("truec-session") || "null"); } catch { return null; }
  }
  public static owns(item: { sellerId?: number }): boolean { return item.sellerId === this.session()?.user.id; }
  private static async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const token = this.session()?.token;
    let res: Response;
    try {
      res = await fetch(path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(5000) });
    } catch { this.online = false; throw new Error("Sin conexión. La operación no se confirmó; consulta el estado antes de reintentar."); }
    this.online = true;
    const data = await res.json();
    if (!res.ok) throw new HttpError(data.error || "No se pudo completar la operación.");
    return data;
  }
  public static async checkHealth() { try { await this.request("/api/health"); return true; } catch { return false; } }
  private static key(key: string) { return "truec-v2:" + (this.session()?.user.id || "guest") + ":" + key; }
  private static cached<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(this.key(key)) || "null") ?? fallback; } catch { return fallback; } }
  private static async read<T>(path: string, property: string, key: string, fallback: T): Promise<T> {
    try { const data = await this.request<Record<string, T>>(path); localStorage.setItem(this.key(key), JSON.stringify(data[property])); return data[property]; }
    catch (e) { if (e instanceof HttpError) throw e; return this.cached(key, fallback); }
  }
  public static async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const session = await this.request<{ user: User; token: string }>("/api/login", "POST", { email: email.trim(), password: pass });
    localStorage.setItem("truec-session", JSON.stringify(session)); return session;
  }
  public static async register(name: string, email: string, pass: string): Promise<{ user: User; token: string }> {
    const session = await this.request<{ user: User; token: string }>("/api/register", "POST", { name: name.trim(), email: email.trim(), password: pass });
    localStorage.setItem("truec-session", JSON.stringify(session)); return session;
  }
  public static async logout() {
    try { await this.request("/api/logout", "POST"); } finally { localStorage.removeItem("truec-session"); }
  }
  public static async getProducts(category = "Todos", search = ""): Promise<Product[]> {
    const list = await this.read<Product[]>("/api/products", "products", "products", DEFAULT_PRODUCTS);
    const q = search.toLowerCase();
    return list.filter(p => (category === "Todos" || p.category === category) && (!q || (p.name + " " + p.description).toLowerCase().includes(q)));
  }
  public static async createProduct(body: Partial<Product>) { return (await this.request<{product: Product}>("/api/products", "POST", body)).product; }
  public static async updateProduct(id: number, body: Partial<Product>) { return (await this.request<{product: Product}>("/api/products/" + id, "PATCH", body)).product; }
  public static async deleteProduct(id: number) { await this.request("/api/products/" + id, "DELETE"); return true; }
  public static getTrades() { return this.read<TradeProposal[]>("/api/trades", "trades", "trades", []); }
  public static async createTrade(body: {wantedProductId: number; wantedProductName: string; offeredItem: string; offeredValue: number; message: string}) { return (await this.request<{trade: TradeProposal}>("/api/trades", "POST", body)).trade; }
  public static async updateTradeStatus(id: number, status: "pending" | "accepted" | "rejected") { return (await this.request<{trade: TradeProposal}>("/api/trades/" + id, "PATCH", {status})).trade; }
  public static async deleteTrade(id: number) { await this.request("/api/trades/" + id, "DELETE"); return true; }
  public static getAuctions() { return this.read<AuctionItem[]>("/api/auctions", "auctions", "auctions", []); }
  public static async createAuction(body: Partial<AuctionItem>) { return (await this.request<{auction: AuctionItem}>("/api/auctions", "POST", body)).auction; }
  public static async updateAuction(id: number, body: Partial<AuctionItem>) { return (await this.request<{auction: AuctionItem}>("/api/auctions/" + id, "PATCH", body)).auction; }
  public static async deleteAuction(id: number) { await this.request("/api/auctions/" + id, "DELETE"); return true; }
  public static getAuctionBids(id = 1) { return this.read<Bid[]>("/api/auctions/" + id + "/bids", "bids", "bids:" + id, []); }
  public static async placeBid(id: number, amount: number) { return (await this.request<{bid: Bid}>("/api/auctions/" + id + "/bids", "POST", {amount})).bid; }
  public static getFavorites(): number[] { return this.cached("favorites", []); }
  public static toggleFavorite(id: number) { const list = this.getFavorites(); const added = !list.includes(id); localStorage.setItem(this.key("favorites"), JSON.stringify(added ? [...list, id] : list.filter(x => x !== id))); return added; }
  public static async resetDemo() { for (const key of Object.keys(localStorage)) if (key.startsWith("truec-v2:")) localStorage.removeItem(key); }
}
