const express = require("express");
const { all, get } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await all("SELECT * FROM products ORDER BY created_at DESC");
    return res.json(products);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await get("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
