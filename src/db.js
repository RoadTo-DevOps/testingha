const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbFilePath = path.join(__dirname, "..", "database.sqlite");
const db = new sqlite3.Database(dbFilePath);

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@shop.local";
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
  if (productCount && productCount.count === 0) {
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

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
