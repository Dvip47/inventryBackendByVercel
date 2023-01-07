const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const addProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    brand,
    title,
    discription,
    specification,
    price,
    sellingprice,
    // photo,
    // photoTitle,
  } = req.body;

  if (
    !name ||
    !category ||
    !brand ||
    !title ||
    !discription ||
    !specification ||
    !sellingprice
  ) {
    res.status(400);
    throw new Error("FILL ALL REQUIRE FEILDS");
  }
  if (sellingprice <= 0) {
    res.status(400);
    throw new Error("Selling price never be 0 rupees");
  }

  //if user email already exist
  const productExist = await Product.findOne({ discription });
  if (productExist) {
    res.status(400);
    throw new Error("Product already exist");
  }

  //create new product
  const product = await Product.create({
    name,
    category,
    brand,
    title,
    discription,
    specification,
    price,
    sellingprice,
  });

  if (product) {
    const {
      _id,
      name,
      category,
      brand,
      title,
      discription,
      specification,
      price,
      sellingprice,
    } = product;
    res.status(201).json({
      message: "Product Add successfully",
      _id,
      name,
      category,
      brand,
      title,
      discription,
      specification,
      price,
      sellingprice,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Product Data");
  }
});

module.exports = {
  addProduct,
};
