const express = require("express");
const router = express.Router();
const { addProduct } = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
router.post("/addproduct", addProduct);

module.exports = router;
