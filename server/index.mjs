import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dataFile = fileURLToPath(new URL("./data.json", import.meta.url));
const port = Number(process.env.API_PORT || 3001);
const readData = async () => JSON.parse(await readFile(dataFile, "utf8"));
const saveData = async (data) => writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  response.end(JSON.stringify(body));
}

async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Error("El cuerpo debe ser JSON válido"); }
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { ok: true, service: "truec-api" });
    const data = await readData();

    if (request.method === "POST" && url.pathname === "/api/login") {
      const { email, password } = await bodyOf(request);
      const user = data.users.find((item) => item.email === email && item.password === password);
      if (!user) return send(response, 401, { error: "Correo o contraseña incorrectos" });
      return send(response, 200, { user: { id: user.id, name: user.name, email: user.email }, token: `demo-${user.id}` });
    }
    if (request.method === "GET" && url.pathname === "/api/products") {
      const category = url.searchParams.get("category");
      return send(response, 200, { products: category ? data.products.filter((item) => item.category === category) : data.products });
    }
    if (request.method === "POST" && url.pathname === "/api/trades") {
      const { wantedProductId, offeredItem, message = "" } = await bodyOf(request);
      if (!wantedProductId || !offeredItem) return send(response, 400, { error: "Faltan datos de la propuesta" });
      const trade = { id: Date.now(), wantedProductId, offeredItem, message, status: "pending", createdAt: new Date().toISOString() };
      data.trades.push(trade); await saveData(data); return send(response, 201, { trade });
    }
    if (request.method === "GET" && url.pathname === "/api/auctions/1/bids") {
      return send(response, 200, { bids: data.bids.filter((item) => item.auctionId === 1).sort((a, b) => b.amount - a.amount) });
    }
    if (request.method === "POST" && url.pathname === "/api/auctions/1/bids") {
      const { amount, user = "yo_usuario" } = await bodyOf(request);
      const top = Math.max(0, ...data.bids.filter((item) => item.auctionId === 1).map((item) => item.amount));
      if (!Number.isFinite(amount) || amount <= top) return send(response, 400, { error: `La puja debe superar $${top}` });
      const bid = { id: Date.now(), auctionId: 1, user, amount, createdAt: new Date().toISOString() };
      data.bids.push(bid); await saveData(data); return send(response, 201, { bid });
    }
    return send(response, 404, { error: "Ruta no encontrada" });
  } catch (error) {
    return send(response, 500, { error: error instanceof Error ? error.message : "Error interno" });
  }
}).listen(port, () => console.log(`Truec-app API disponible en http://localhost:${port}`));
