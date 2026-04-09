const express = require("express");
const { all, get, run } = require("../db");
const { authRequired, adminOnly } = require("../middlewares/auth");

const router = express.Router();

router.use(authRequired, adminOnly);

router.get("/users", async (req, res, next) => {
  try {
    const users = await all(
      "SELECT id, full_name AS fullName, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC"
    );
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["admin", "user"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role must be admin or user" });
    }

    const user = await get("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await run("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    return res.json({ message: "User role updated" });
  } catch (error) {
    return next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const { name, description = "", price, stock = 0, imageUrl = "" } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const result = await run(
      "INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), String(description), Number(price), Number(stock), String(imageUrl)]
    );

    return res.status(201).json({ id: result.lastID, message: "Product created" });
  } catch (error) {
    return next(error);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const { name, description = "", price, stock = 0, imageUrl = "" } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const product = await get("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await run(
      `
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [name.trim(), String(description), Number(price), Number(stock), String(imageUrl), req.params.id]
    );

    return res.json({ message: "Product updated" });
  } catch (error) {
    return next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await get("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await run("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.json({ message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
