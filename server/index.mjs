import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dataFile = fileURLToPath(new URL("./data.json", import.meta.url));
const port = Number(process.env.API_PORT || 3001);

const readData = async () => JSON.parse(await readFile(dataFile, "utf8"));
const saveData = async (data) => writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("El cuerpo de la solicitud debe ser un formato JSON válido");
  }
}

// Regex estricta para validación de correos electrónicos con '@' y dominio
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let initialSeedData = null;

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});

  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = url.pathname;

  try {
    if (!initialSeedData) {
      initialSeedData = JSON.stringify(await readData());
    }

    // Health Check
    if (request.method === "GET" && pathname === "/api/health") {
      return send(response, 200, {
        ok: true,
        service: "truec-api",
        version: "1.2.0",
        timestamp: new Date().toISOString(),
      });
    }

    const data = await readData();

    // ─────────────────────────────────────────────────────────────────────────
    // 1. AUTENTICACIÓN (LOGIN & REGISTRO CON VALIDACIÓN DE '@' Y EXCEPCIONES)
    // ─────────────────────────────────────────────────────────────────────────

    // POST /api/login
    if (request.method === "POST" && pathname === "/api/login") {
      const { email, password } = await bodyOf(request);

      // Excepciones de validación de entrada
      if (!email || typeof email !== "string" || !email.trim()) {
        return send(response, 400, { error: "Excepción: El correo electrónico es un campo obligatorio." });
      }
      if (!email.includes("@") || !EMAIL_REGEX.test(email.trim())) {
        return send(response, 400, {
          error: "Excepción: El correo electrónico debe contener un '@' y un dominio válido (ejemplo: usuario@correo.com).",
        });
      }
      if (!password || typeof password !== "string" || !password.trim()) {
        return send(response, 400, { error: "Excepción: La contraseña es obligatoria." });
      }

      // Comprobación de credenciales
      const user = data.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) {
        return send(response, 401, {
          error: "Excepción de autenticación: Correo electrónico o contraseña incorrectos (Código 401).",
        });
      }

      return send(response, 200, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          rating: user.rating || 4.9,
          reviews: user.reviews || 0,
          trades: user.trades || 0,
          publications: user.publications || 0,
        },
        token: `auth-token-${user.id}-${Date.now()}`,
        message: "¡Autenticación exitosa!",
      });
    }

    // POST /api/register (Nuevo registro de usuario con validaciones de '@')
    if (request.method === "POST" && pathname === "/api/register") {
      const { name, email, password } = await bodyOf(request);

      if (!name || typeof name !== "string" || name.trim().length < 3) {
        return send(response, 400, { error: "Excepción: El nombre completo debe tener al menos 3 caracteres." });
      }
      if (!email || !email.includes("@") || !EMAIL_REGEX.test(email.trim())) {
        return send(response, 400, {
          error: "Excepción: Formato de correo inválido. Debe contener '@' y un dominio válido (ej. tu@correo.com).",
        });
      }
      if (!password || password.length < 6) {
        return send(response, 400, {
          error: "Excepción: La contraseña debe tener un mínimo de 6 caracteres por seguridad.",
        });
      }

      const existing = data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return send(response, 409, {
          error: "Excepción: Ya existe una cuenta registrada con este correo electrónico.",
        });
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        rating: 5.0,
        reviews: 0,
        trades: 0,
        publications: 0,
      };

      data.users.push(newUser);
      await saveData(data);

      return send(response, 201, {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          rating: newUser.rating,
          reviews: newUser.reviews,
          trades: newUser.trades,
          publications: newUser.publications,
        },
        token: `auth-token-${newUser.id}-${Date.now()}`,
        message: "¡Cuenta creada exitosamente con autenticación verificada!",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CRUD DE PRODUCTOS (CREATE, READ, UPDATE, DELETE)
    // ─────────────────────────────────────────────────────────────────────────

    // READ: GET /api/products
    if (request.method === "GET" && pathname === "/api/products") {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search")?.toLowerCase().trim();
      let list = [...data.products];

      if (category && category !== "Todos") {
        list = list.filter((item) => item.category === category);
      }
      if (search) {
        list = list.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search)
        );
      }
      return send(response, 200, { products: list, count: list.length });
    }

    // CREATE: POST /api/products
    if (request.method === "POST" && pathname === "/api/products") {
      const { name, price, condition, category, acceptsBarter, img, description, specs, sellerName } = await bodyOf(request);

      if (!name || typeof name !== "string" || !name.trim()) {
        return send(response, 400, { error: "Excepción: El nombre del producto es obligatorio." });
      }
      const numPrice = Number(price);
      if (!price || isNaN(numPrice) || numPrice <= 0) {
        return send(response, 400, { error: "Excepción: El precio debe ser un número mayor a $0 MXN." });
      }
      if (!category) {
        return send(response, 400, { error: "Excepción: La categoría del producto es obligatoria." });
      }

      const newProduct = {
        id: Date.now(),
        name: name.trim(),
        price: numPrice,
        condition: condition || "Buen estado",
        category,
        acceptsBarter: Boolean(acceptsBarter),
        img: img || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop&auto=format",
        description: description || "Artículo tecnológico en excelentes condiciones, listo para entrega.",
        seller: {
          name: sellerName || "Sergio Mendoza",
          verified: true,
          rating: 4.9,
          sales: 8,
        },
        specs: specs || [
          ["Categoría", category],
          ["Garantía", "Funcional 100% verificado"],
        ],
        createdAt: new Date().toISOString(),
      };

      data.products.unshift(newProduct);
      await saveData(data);
      return send(response, 201, { product: newProduct, message: "¡Producto creado y publicado en el catálogo!" });
    }

    // UPDATE: PUT/PATCH /api/products/:id
    if ((request.method === "PUT" || request.method === "PATCH") && pathname.startsWith("/api/products/")) {
      const id = Number(pathname.split("/").pop());
      const prod = data.products.find((p) => p.id === id);
      if (!prod) {
        return send(response, 404, { error: `Excepción: No se encontró el producto con ID ${id}` });
      }

      const updates = await bodyOf(request);
      if (updates.name) prod.name = updates.name.trim();
      if (updates.price) prod.price = Number(updates.price);
      if (updates.condition) prod.condition = updates.condition;
      if (updates.category) prod.category = updates.category;
      if (updates.description) prod.description = updates.description.trim();
      if (updates.acceptsBarter !== undefined) prod.acceptsBarter = Boolean(updates.acceptsBarter);

      await saveData(data);
      return send(response, 200, { product: prod, message: "Producto actualizado correctamente." });
    }

    // DELETE: DELETE /api/products/:id
    if (request.method === "DELETE" && pathname.startsWith("/api/products/")) {
      const id = Number(pathname.split("/").pop());
      const idx = data.products.findIndex((p) => p.id === id);
      if (idx === -1) {
        return send(response, 404, { error: `Excepción: Producto con ID ${id} no encontrado para eliminar.` });
      }

      const deleted = data.products.splice(idx, 1)[0];
      await saveData(data);
      return send(response, 200, { ok: true, deleted, message: `Producto '${deleted.name}' eliminado con éxito.` });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CRUD DE PROPUESTAS DE TRUEQUE
    // ─────────────────────────────────────────────────────────────────────────

    // READ: GET /api/trades
    if (request.method === "GET" && pathname === "/api/trades") {
      return send(response, 200, {
        trades: data.trades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      });
    }

    // CREATE: POST /api/trades
    if (request.method === "POST" && pathname === "/api/trades") {
      const { wantedProductId, offeredItem, offeredValue = 0, message = "" } = await bodyOf(request);

      if (!wantedProductId) {
        return send(response, 400, { error: "Excepción: Debes especificar el producto que deseas recibir." });
      }
      if (!offeredItem || !offeredItem.trim()) {
        return send(response, 400, { error: "Excepción: Debes especificar el artículo que ofreces a cambio." });
      }

      const wantedProd = data.products.find((p) => p.id === Number(wantedProductId));
      const trade = {
        id: Date.now(),
        wantedProductId: Number(wantedProductId),
        wantedProductName: wantedProd ? wantedProd.name : "Producto tecnológico",
        offeredItem: offeredItem.trim(),
        offeredValue: Number(offeredValue) || 0,
        message: message.trim(),
        senderName: "Sergio Mendoza",
        sellerName: wantedProd ? wantedProd.seller?.name || "Vendedor" : "Vendedor",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      data.trades.unshift(trade);
      await saveData(data);
      return send(response, 201, { trade, message: "Propuesta de trueque registrada exitosamente." });
    }

    // UPDATE: PATCH /api/trades/:id
    if (request.method === "PATCH" && pathname.startsWith("/api/trades/")) {
      const tradeId = Number(pathname.split("/").pop());
      const { status } = await bodyOf(request);

      if (!["pending", "accepted", "rejected"].includes(status)) {
        return send(response, 400, {
          error: "Excepción: Estado no válido. Debe ser 'pending', 'accepted' o 'rejected'.",
        });
      }

      const trade = data.trades.find((t) => t.id === tradeId);
      if (!trade) {
        return send(response, 404, { error: `Excepción: Propuesta con ID ${tradeId} no encontrada.` });
      }

      trade.status = status;
      trade.updatedAt = new Date().toISOString();
      await saveData(data);
      return send(response, 200, { trade, message: `Propuesta actualizada al estado '${status}'.` });
    }

    // DELETE: DELETE /api/trades/:id
    if (request.method === "DELETE" && pathname.startsWith("/api/trades/")) {
      const tradeId = Number(pathname.split("/").pop());
      const idx = data.trades.findIndex((t) => t.id === tradeId);
      if (idx === -1) {
        return send(response, 404, { error: `Excepción: Propuesta con ID ${tradeId} no encontrada para eliminar.` });
      }

      const deleted = data.trades.splice(idx, 1)[0];
      await saveData(data);
      return send(response, 200, { ok: true, deleted, message: "Propuesta de trueque eliminada del registro." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SUBASTAS Y PUJAS
    // ─────────────────────────────────────────────────────────────────────────

    // GET /api/auctions/:id/bids
    if (request.method === "GET" && pathname.match(/^\/api\/auctions\/\d+\/bids$/)) {
      const auctionId = Number(pathname.split("/")[3]);
      const bids = data.bids
        .filter((item) => item.auctionId === auctionId)
        .sort((a, b) => b.amount - a.amount);
      return send(response, 200, { bids, topBid: bids[0]?.amount || 0 });
    }

    // POST /api/auctions/:id/bids
    if (request.method === "POST" && pathname.match(/^\/api\/auctions\/\d+\/bids$/)) {
      const auctionId = Number(pathname.split("/")[3]);
      const { amount, user = "Sergio Mendoza (Tú)" } = await bodyOf(request);

      const top = Math.max(0, ...data.bids.filter((item) => item.auctionId === auctionId).map((item) => item.amount));

      if (!Number.isFinite(amount) || amount <= top) {
        return send(response, 400, {
          error: `Excepción de puja: La oferta ($${amount}) debe superar la puja líder actual ($${top.toLocaleString()} MXN).`,
        });
      }

      const bid = {
        id: Date.now(),
        auctionId,
        user,
        amount,
        time: "Ahora mismo",
        avatar: "SM",
        createdAt: new Date().toISOString(),
      };

      data.bids.unshift(bid);
      await saveData(data);
      return send(response, 201, {
        bid,
        message: `¡Puja aceptada! Ahora lideras la subasta con $${amount.toLocaleString()} MXN.`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. RESET DEMO DATA
    // ─────────────────────────────────────────────────────────────────────────
    if (request.method === "POST" && pathname === "/api/reset") {
      if (initialSeedData) {
        await saveData(JSON.parse(initialSeedData));
        return send(response, 200, { ok: true, message: "Base de datos restaurada al estado de fábrica." });
      }
      return send(response, 200, { ok: true, message: "Base de datos sincronizada." });
    }

    return send(response, 404, { error: `Excepción: Ruta '${pathname}' no encontrada en la API.` });
  } catch (error) {
    console.error("API Exception:", error);
    return send(response, 500, {
      error: error instanceof Error ? `Excepción interna: ${error.message}` : "Error interno del servidor",
    });
  }
}).listen(port, () => console.log(`✓ Truec-app API v1.2.0 lista con CRUD completo en http://localhost:${port}`));
