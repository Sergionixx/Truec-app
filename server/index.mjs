import { createServer } from "node:http";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const file = process.env.DATA_FILE || fileURLToPath(new URL("./runtime/data.json", import.meta.url));
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const text = (v, name) => typeof v === "string" && v.trim() ? v.trim() : fail(400, name + " es obligatorio.");
const money = (v, zero = false) => {
  const n = Number(v);
  if (v === null || v === "" || typeof v === "boolean" || !Number.isFinite(n) || n < (zero ? 0 : .01) || n > 10000000) fail(400, "Importe inválido.");
  return Math.round(n * 100) / 100;
};
const hashPassword = (p, salt = randomBytes(16).toString("hex")) => salt + ":" + scryptSync(p, salt, 64).toString("hex");
const matches = (p, hash) => { const [salt, digest] = hash.split(":"); return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(hashPassword(p, salt).split(":")[1], "hex")); };
const safeUser = ({ password, passwordHash, ...user }) => user;
const digest = token => createHash("sha256").update(token || "").digest("hex");
const now = () => new Date().toISOString();
const nextId = list => Math.max(Date.now(), ...list.map(x => x.id + 1));
async function save(data) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file + ".tmp", JSON.stringify(data, null, 2));
  await rename(file + ".tmp", file);
}
let initial;
try { initial = JSON.parse(await readFile(file, "utf8")); }
catch (e) { if (e.code !== "ENOENT") throw e; initial = JSON.parse(await readFile(new URL("./data.json", import.meta.url), "utf8")); }
for (const u of initial.users) { if (u.password) { u.passwordHash = hashPassword(u.password); delete u.password; } }
if (!initial.users.some(u => u.id === 2)) initial.users.push({ id: 2, name: "Vendedor de ejemplo", email: "vendedor@truec.app", passwordHash: hashPassword("demo123"), rating: 0, reviews: 0, trades: 0, publications: 0 });
for (const p of initial.products) p.sellerId ??= 2;
initial.sessions ??= [];
initial.auctions ??= initial.products.slice(0, 2).map((p, i) => ({ id: i + 1, name: p.name, startingPrice: i ? 9500 : 3500, img: p.img, description: p.description, seller: p.seller.name, sellerId: 2, endsAt: new Date(Date.now() + 86400000).toISOString() }));
for (const t of initial.trades) { t.senderId ??= 1; t.sellerId ??= 2; }
await save(initial);
function send(res, status, body) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(body)); }
async function bodyOf(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 65536) fail(413, "Solicitud demasiado grande."); chunks.push(chunk); }
  try { const v = JSON.parse(Buffer.concat(chunks).toString() || "{}"); if (!v || Array.isArray(v) || typeof v !== "object") fail(400, "JSON inválido."); return v; } catch { fail(400, "JSON inválido."); }
}
function authorize(req, data) {
  const hash = digest(req.headers.authorization?.replace(/^Bearer /, ""));
  const session = data.sessions.find(s => s.hash === hash && s.expires > Date.now());
  return data.users.find(u => u.id === session?.userId) || fail(401, "Inicia sesión para continuar.");
}
function owner(item, user) { if (item.sellerId !== user.id) fail(403, "Solo el propietario puede modificar este artículo."); }
function image(v) { const url = text(v, "Imagen"); if (!/^https?:\/\//.test(url) && !url.startsWith("/")) fail(400, "URL de imagen inválida."); return url; }
function productFields(input, previous = {}) {
  const p = { ...previous, ...input };
  return { name: text(p.name, "Nombre"), price: money(p.price), category: text(p.category, "Categoría"), condition: text(p.condition, "Condición"), description: text(p.description, "Descripción"), img: image(p.img), acceptsBarter: Boolean(p.acceptsBarter), specs: Array.isArray(p.specs) ? p.specs.filter(x => Array.isArray(x) && x.length === 2 && x.every(v => typeof v === "string")) : [] };
}
function auctionFields(input, previous = {}) {
  const a = { ...previous, ...input };
  const endsAt = a.endsAt || new Date(Date.now() + 86400000).toISOString();
  if (!Number.isFinite(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.now()) fail(400, "La fecha de cierre debe ser futura.");
  return { name: text(a.name, "Nombre"), startingPrice: money(a.startingPrice), description: text(a.description, "Descripción"), img: image(a.img), endsAt };
}
async function handle(req, res, body) {
  const path = new URL(req.url, "http://localhost").pathname;
  const method = req.method;
  if (path === "/api/health") return send(res, 200, { ok: true, service: "truec-api" });
  const data = JSON.parse(await readFile(file, "utf8"));
  const commit = async (status, result) => { await save(data); send(res, status, result); };
  if (method === "POST" && ["/api/login", "/api/register"].includes(path)) {
    const email = text(body.email, "Correo").toLowerCase();
    const password = text(body.password, "Contraseña");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, "Correo inválido.");
    let user = data.users.find(u => u.email.toLowerCase() === email);
    if (path.endsWith("register")) {
      if (user) fail(409, "Este correo ya está registrado.");
      if (password.length < 6) fail(400, "La contraseña debe tener al menos 6 caracteres.");
      user = { id: nextId(data.users), name: text(body.name, "Nombre"), email, passwordHash: hashPassword(password), rating: 0, reviews: 0, trades: 0, publications: 0 }; data.users.push(user);
    } else if (!user || !matches(password, user.passwordHash)) fail(401, "Correo o contraseña incorrectos.");
    const token = randomBytes(32).toString("hex");
    data.sessions = data.sessions.filter(s => s.expires > Date.now());
    data.sessions.push({ hash: digest(token), userId: user.id, expires: Date.now() + 86400000 });
    return commit(path.endsWith("register") ? 201 : 200, { user: safeUser(user), token });
  }
  if (method === "GET" && path === "/api/products") return send(res, 200, { products: data.products });
  if (method === "GET" && path === "/api/auctions") return send(res, 200, { auctions: data.auctions });
  const bidMatch = path.match(/^\/api\/auctions\/(\d+)\/bids$/);
  if (bidMatch && method === "GET") {
    const id = Number(bidMatch[1]);
    if (!data.auctions.some(a => a.id === id)) fail(404, "Subasta no encontrada.");
    return send(res, 200, { bids: data.bids.filter(b => b.auctionId === id).sort((a, b) => b.amount - a.amount) });
  }
  const user = authorize(req, data);
  if (path === "/api/me" && method === "GET") return send(res, 200, { user: safeUser(user) });
  if (path === "/api/logout" && method === "POST") { data.sessions = data.sessions.filter(s => s.hash !== digest(req.headers.authorization.slice(7))); return commit(200, { ok: true }); }
  if (path === "/api/products" && method === "POST") {
    const product = { ...productFields(body), id: nextId(data.products), sellerId: user.id, seller: { name: user.name, verified: false, rating: user.rating, sales: 0 }, createdAt: now() };
    data.products.unshift(product); return commit(201, { product });
  }
  const productMatch = path.match(/^\/api\/products\/(\d+)$/);
  if (productMatch) {
    const p = data.products.find(p => p.id === Number(productMatch[1])) || fail(404, "Producto no encontrado."); owner(p, user);
    if (method === "PATCH" || method === "PUT") { Object.assign(p, productFields(body, p)); return commit(200, { product: p }); }
    if (method === "DELETE") { if (data.trades.some(t => t.wantedProductId === p.id && t.status === "pending")) fail(409, "Hay propuestas pendientes para este producto."); data.products = data.products.filter(x => x.id !== p.id); return commit(200, { ok: true }); }
  }
  if (path === "/api/trades" && method === "GET") return send(res, 200, { trades: data.trades.filter(t => [t.senderId, t.sellerId].includes(user.id)) });
  if (path === "/api/trades" && method === "POST") {
    const p = data.products.find(p => p.id === Number(body.wantedProductId)) || fail(404, "Producto no encontrado.");
    if (!p.acceptsBarter || p.sellerId === user.id) fail(400, "Este producto no admite esa propuesta.");
    const trade = { id: nextId(data.trades), wantedProductId: p.id, wantedProductName: p.name, offeredItem: text(body.offeredItem, "Artículo ofrecido"), offeredValue: money(body.offeredValue ?? 0, true), message: String(body.message || "").slice(0, 2000), senderId: user.id, sellerId: p.sellerId, senderName: user.name, sellerName: p.seller.name, status: "pending", createdAt: now() };
    data.trades.unshift(trade); return commit(201, { trade });
  }
  const tradeMatch = path.match(/^\/api\/trades\/(\d+)$/);
  if (tradeMatch) {
    const t = data.trades.find(t => t.id === Number(tradeMatch[1])) || fail(404, "Propuesta no encontrada.");
    if (method === "PATCH") { if (t.sellerId !== user.id) fail(403, "Solo el destinatario puede responder."); if (t.status !== "pending") fail(409, "La propuesta ya fue respondida."); if (!["accepted", "rejected"].includes(body.status)) fail(400, "Estado inválido."); t.status = body.status; t.updatedAt = now(); return commit(200, { trade: t }); }
    if (method === "DELETE") { if (t.senderId !== user.id || t.status !== "pending") fail(403, "Solo puedes retirar tus propuestas pendientes."); data.trades = data.trades.filter(x => x.id !== t.id); return commit(200, { ok: true }); }
  }
  if (path === "/api/auctions" && method === "POST") {
    const auction = { ...auctionFields(body), id: nextId(data.auctions), seller: user.name, sellerId: user.id, createdAt: now() }; data.auctions.unshift(auction); return commit(201, { auction });
  }
  const auctionMatch = path.match(/^\/api\/auctions\/(\d+)$/);
  if (auctionMatch) {
    const a = data.auctions.find(a => a.id === Number(auctionMatch[1])) || fail(404, "Subasta no encontrada."); owner(a, user);
    if (data.bids.some(b => b.auctionId === a.id)) fail(409, "Una subasta con pujas no puede modificarse ni eliminarse.");
    if (method === "PATCH") { Object.assign(a, auctionFields(body, a)); return commit(200, { auction: a }); }
    if (method === "DELETE") { data.auctions = data.auctions.filter(x => x.id !== a.id); return commit(200, { ok: true }); }
  }
  if (bidMatch && method === "POST") {
    const a = data.auctions.find(a => a.id === Number(bidMatch[1])) || fail(404, "Subasta no encontrada.");
    if (a.sellerId === user.id) fail(403, "No puedes pujar en tu propia subasta.");
    if (Date.parse(a.endsAt) <= Date.now()) fail(409, "La subasta ha terminado.");
    const amount = money(body.amount); const top = Math.max(a.startingPrice, ...data.bids.filter(b => b.auctionId === a.id).map(b => b.amount));
    if (amount <= top) fail(409, "La puja debe superar $" + top + ".");
    const bid = { id: nextId(data.bids), auctionId: a.id, userId: user.id, user: user.name, amount, time: "Ahora mismo", avatar: user.name.slice(0, 2).toUpperCase(), createdAt: now() }; data.bids.unshift(bid); return commit(201, { bid });
  }
  fail(404, "Ruta no encontrada.");
}
// Serialize read-modify-write transactions to prevent lost concurrent writes.
let queue = Promise.resolve();
createServer(async (req, res) => {
  try { const body = await bodyOf(req); queue = queue.then(() => handle(req, res, body)).catch(e => send(res, e.status || 500, { error: e.status ? e.message : "No se pudo guardar la operación." })); }
  catch (e) { send(res, e.status || 400, { error: e.message }); }
}).listen(Number(process.env.API_PORT || 3001), process.env.API_HOST || "127.0.0.1", () => console.log("Truec API lista"));
