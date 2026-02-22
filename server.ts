import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "zaiboost-super-secret-key-change-in-production";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "zaiboost-32-char-enc-key-change!!";
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.join(__dirname, "zaiboost.db.json");

function base64url(str: string) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function signJWT(payload: object, expiresInHours = 72): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + expiresInHours * 3600 * 1000 }));
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyJWT(token: string): any {
  const [header, body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (expected !== sig) throw new Error("Invalid signature");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now()) throw new Error("Token expired");
  return payload;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const inputHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(inputHash));
}

function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}
function decrypt(text: string): string {
  try {
    const [ivHex, encrypted] = text.split(":");
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  } catch { return "[encrypted]"; }
}

interface DbData {
  users: any[];
  services: any[];
  orders: any[];
  reviews: any[];
  counters: { users: number; services: number; orders: number; reviews: number };
}

function loadDb(): DbData {
  if (fs.existsSync(DB_PATH)) {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  }
  return { users: [], services: [], orders: [], reviews: [], counters: { users: 0, services: 0, orders: 0, reviews: 0 } };
}
function saveDb(data: DbData) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = loadDb();

if (db.services.length === 0) {
  const services = [
    { game: "genshin", category: "daily",   name: "Genshin: Paket Mingguan (7 Hari)",        description: "Daily Commission + Resin + Event + Battle Pass Daily",   price_base: 0,     price_per_unit: 5000, unit_name: "hari" },
    { game: "genshin", category: "daily",   name: "Genshin: Paket Bulanan (30 Hari)",         description: "Full Maintenance: Daily + Resin + Event + BP + Weekly Boss", price_base: 0, price_per_unit: 4000, unit_name: "hari" },
    { game: "genshin", category: "explore", name: "Genshin: Mondstadt 100%",                  description: "Eksplorasi wilayah Mondstadt per 1% progress",            price_base: 0,     price_per_unit: 2500, unit_name: "%" },
    { game: "genshin", category: "explore", name: "Genshin: Liyue 100%",                      description: "Eksplorasi wilayah Liyue per 1% progress",               price_base: 0,     price_per_unit: 3000, unit_name: "%" },
    { game: "genshin", category: "explore", name: "Genshin: Inazuma 100%",                    description: "Eksplorasi wilayah Inazuma per 1% progress",             price_base: 0,     price_per_unit: 3500, unit_name: "%" },
    { game: "genshin", category: "explore", name: "Genshin: Sumeru 100%",                     description: "Eksplorasi wilayah Sumeru per 1% progress",              price_base: 0,     price_per_unit: 4500, unit_name: "%" },
    { game: "genshin", category: "explore", name: "Genshin: Fontaine 100%",                   description: "Eksplorasi wilayah Fontaine per 1% progress",            price_base: 0,     price_per_unit: 4000, unit_name: "%" },
    { game: "genshin", category: "explore", name: "Genshin: Natlan 100%",                     description: "Eksplorasi wilayah Natlan per 1% progress",              price_base: 0,     price_per_unit: 5000, unit_name: "%" },
    { game: "genshin", category: "endgame", name: "Genshin: Spiral Abyss (36 Stars)",         description: "Full Clear Floor 9-12 dengan 36 Bintang (Garansi)",      price_base: 60000, price_per_unit: 0,    unit_name: "clear" },
    { game: "genshin", category: "endgame", name: "Genshin: Imaginarium Theater (Visionary)", description: "Full Clear Mode Visionary / Hard Mode",                   price_base: 50000, price_per_unit: 0,    unit_name: "clear" },
    { game: "wuwa",    category: "daily",   name: "WuWa: Daily Maintenance (7 Hari)",         description: "Daily Activity + Waveplates + Echo Farming + BP",        price_base: 0,     price_per_unit: 6000, unit_name: "hari" },
    { game: "wuwa",    category: "daily",   name: "WuWa: Monthly Maintenance (30 Hari)",      description: "Full Maintenance: Daily + Waveplates + BP + Events",     price_base: 0,     price_per_unit: 5000, unit_name: "hari" },
    { game: "wuwa",    category: "explore", name: "WuWa: Jinzhou 100%",                       description: "Eksplorasi wilayah Jinzhou per 1% progress",             price_base: 0,     price_per_unit: 3000, unit_name: "%" },
    { game: "wuwa",    category: "explore", name: "WuWa: Central Plains 100%",                description: "Eksplorasi wilayah Central Plains per 1% progress",      price_base: 0,     price_per_unit: 3500, unit_name: "%" },
    { game: "wuwa",    category: "explore", name: "WuWa: Mt. Firmament 100%",                 description: "Eksplorasi wilayah Mt. Firmament per 1% progress",       price_base: 0,     price_per_unit: 5500, unit_name: "%" },
    { game: "wuwa",    category: "explore", name: "WuWa: Black Shores 100%",                  description: "Eksplorasi wilayah Black Shores per 1% progress",        price_base: 0,     price_per_unit: 6000, unit_name: "%" },
    { game: "wuwa",    category: "endgame", name: "WuWa: Tower of Adversity (30/30 Stars)",   description: "Full Clear Hazard Zone dengan 30 Bintang (Garansi)",     price_base: 75000, price_per_unit: 0,    unit_name: "clear" },
    { game: "wuwa",    category: "endgame", name: "WuWa: Hologram Calamity (Difficulty 6)",   description: "Clear Hologram Strategy Difficulty 6 (Per Boss)",        price_base: 30000, price_per_unit: 0,    unit_name: "boss" },
  ];
  services.forEach(s => {
    db.counters.services++;
    db.services.push({ id: db.counters.services, ...s, created_at: new Date().toISOString() });
  });
  saveDb(db);
}

if (!db.users.find((u: any) => u.username === "admin")) {
  db.counters.users++;
  db.users.push({ id: db.counters.users, username: "admin", password: hashPassword("admin123"), role: "admin", created_at: new Date().toISOString() });
  saveDb(db);
  console.log("✅ Default admin → username: admin | password: admin123");
}

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Token required" }); return; }
  try { req.user = verifyJWT(auth.slice(7)); next(); }
  catch { res.status(401).json({ error: "Invalid or expired token" }); }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
    next();
  });
}

function validateBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(f => !req.body[f]);
    if (missing.length > 0) { res.status(400).json({ error: `Missing: ${missing.join(", ")}` }); return; }
    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post("/api/auth/register", validateBody(["username", "password"]), (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username.length < 3) { res.status(400).json({ error: "Username minimal 3 karakter" }); return; }
    if (password.length < 6) { res.status(400).json({ error: "Password minimal 6 karakter" }); return; }
    if (db.users.find((u: any) => u.username === username)) { res.status(400).json({ error: "Username sudah digunakan" }); return; }
    db.counters.users++;
    const user = { id: db.counters.users, username, password: hashPassword(password), role: "customer", created_at: new Date().toISOString() };
    db.users.push(user);
    saveDb(db);
    const payload = { id: user.id, username: user.username, role: user.role };
    res.json({ ...payload, token: signJWT(payload) });
  });

  app.post("/api/auth/login", validateBody(["username", "password"]), (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = db.users.find((u: any) => u.username === username);
    if (!user || !verifyPassword(password, user.password)) { res.status(401).json({ error: "Username atau password salah" }); return; }
    const payload = { id: user.id, username: user.username, role: user.role };
    res.json({ ...payload, token: signJWT(payload) });
  });

  app.get("/api/services", (_req: Request, res: Response) => {
    res.json(db.services);
  });

  app.post("/api/orders", requireAuth, validateBody(["service_id", "uid", "server", "game_username", "game_password"]), (req: AuthRequest, res: Response) => {
    const { service_id, game, uid, server, game_username, game_password, total_price, start_value, target_value, notes } = req.body;
    const service = db.services.find((s: any) => s.id === Number(service_id));
    if (!service) { res.status(404).json({ error: "Layanan tidak ditemukan" }); return; }
    db.counters.orders++;
    const order = {
      id: db.counters.orders, user_id: req.user!.id, service_id: Number(service_id),
      game: game || service.game, uid, server, game_username,
      game_password: encrypt(game_password),
      total_price: total_price || 0, status: "pending",
      start_value: start_value || 0, current_value: start_value || 0,
      target_value: target_value || 0, notes: notes || "",
      created_at: new Date().toISOString()
    };
    db.orders.push(order);
    saveDb(db);
    res.status(201).json({ id: order.id, message: "Order berhasil dibuat" });
  });

  app.get("/api/orders/user/:userId", requireAuth, (req: AuthRequest, res: Response) => {
    const userId = Number(req.params.userId);
    if (req.user!.role !== "admin" && req.user!.id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    const orders = db.orders
      .filter((o: any) => o.user_id === userId)
      .map((o: any) => {
        const service = db.services.find((s: any) => s.id === o.service_id);
        return { ...o, service_name: service?.name, service_category: service?.category };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(orders);
  });

  app.get("/api/orders/admin", requireAdmin, (_req: Request, res: Response) => {
    const orders = db.orders
      .map((o: any) => {
        const service = db.services.find((s: any) => s.id === o.service_id);
        const user = db.users.find((u: any) => u.id === o.user_id);
        return { ...o, service_name: service?.name, service_category: service?.category, username: user?.username, game_password: o.game_password ? decrypt(o.game_password) : null };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(orders);
  });

  app.patch("/api/orders/:id", requireAdmin, (req: Request, res: Response) => {
    const { status, current_value } = req.body;
    const id = Number(req.params.id);
    const order = db.orders.find((o: any) => o.id === id);
    if (!order) { res.status(404).json({ error: "Order tidak ditemukan" }); return; }
    if (status !== undefined) order.status = status;
    if (current_value !== undefined) order.current_value = current_value;
    saveDb(db);
    res.json({ success: true });
  });

  app.get("/api/admin/stats", requireAdmin, (_req: Request, res: Response) => {
    const completed = db.orders.filter((o: any) => o.status === "completed");
    const revenue = completed.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
    const activeOrders = db.orders.filter((o: any) => ["pending", "processing"].includes(o.status)).length;
    const totalUsers = db.users.filter((u: any) => u.role === "customer").length;
    res.json({ revenue, activeOrders, totalUsers, completedOrders: completed.length });
  });

  app.get("/api/reviews", (_req: Request, res: Response) => {
    const reviews = db.reviews.slice(-10).reverse().map((r: any) => {
      const user = db.users.find((u: any) => u.id === r.user_id);
      return { ...r, username: user?.username };
    });
    res.json(reviews);
  });

  app.post("/api/reviews", requireAuth, validateBody(["rating", "comment"]), (req: AuthRequest, res: Response) => {
    const { order_id, rating, comment } = req.body;
    if (rating < 1 || rating > 5) { res.status(400).json({ error: "Rating harus antara 1-5" }); return; }
    db.counters.reviews++;
    db.reviews.push({ id: db.counters.reviews, order_id: order_id || null, user_id: req.user!.id, rating, comment, created_at: new Date().toISOString() });
    saveDb(db);
    res.status(201).json({ id: db.counters.reviews });
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req: Request, res: Response) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ZaiBoost server running → http://localhost:${PORT}`);
  });
}

startServer();
