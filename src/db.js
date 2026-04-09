const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const dbClient = "postgres";

function toBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function buildPgPool() {
  const sslEnabled = toBoolean(process.env.PG_SSL, true);
  const rejectUnauthorized = toBoolean(process.env.PG_SSL_REJECT_UNAUTHORIZED, false);
  const ssl = sslEnabled ? { rejectUnauthorized } : false;

  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl
    });
  }

  return new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl
  });
}

const pgPool = buildPgPool();

function toPgQuery(query) {
  let index = 0;
  return query.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

async function run(query, params = []) {
  let pgQuery = toPgQuery(query);
  if (/^\s*insert\s+/i.test(pgQuery) && !/\sreturning\s+/i.test(pgQuery)) {
    pgQuery = `${pgQuery} RETURNING id`;
  }

  const result = await pgPool.query(pgQuery, params);
  return {
    lastID: result.rows[0] ? result.rows[0].id : undefined,
    rowCount: result.rowCount
  };
}

async function get(query, params = []) {
  const result = await pgPool.query(toPgQuery(query), params);
  return result.rows[0];
}

async function all(query, params = []) {
  const result = await pgPool.query(toPgQuery(query), params);
  return result.rows;
}

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(12, 2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedData() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@shop.local").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await run(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      ["Administrator", adminEmail, passwordHash]
    );
  }

  const productCount = await get("SELECT COUNT(*) AS count FROM products");
  if (productCount && Number(productCount.count) === 0) {
    const samples = [
      ["Tai nghe Bluetooth", "Âm thanh sống động, pin 20 giờ", 590000, 25, "https://picsum.photos/seed/headphone/400/300"],
      ["Chuột Gaming", "DPI cao, led RGB", 390000, 40, "https://picsum.photos/seed/mouse/400/300"],
      ["Bàn phím cơ", "Switch tactile, keycap PBT", 1290000, 15, "https://picsum.photos/seed/keyboard/400/300"]
    ];

    for (const product of samples) {
      await run(
        "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
        product
      );
    }
  }
}

async function initDb() {
  await createTables();
  await seedData();
}

module.exports = {
  db: pgPool,
  dbClient,
  run,
  get,
  all,
  initDb
};
