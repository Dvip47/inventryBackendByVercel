const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "Fill name"],
  },
  category: {
    type: String,
    require: [true, "Select Category"],
  },
  brand: {
    type: String,
    require: [true, "Enter brand name"],
  },
  title: {
    type: String,
    require: [true, "Enter title"],
  },
  discription: {
    type: String,
    require: [true, "Fill discription"],
  },
  specification: {
    type: String,
  },
  price: {
    type: Number,
  },
  sellingprice: {
    type: Number,
    require: [true, "Enter selling price"],
  },
  photo: {
    type: String,
    require: [true, "Please chhose any photo"],
    default: "https://i.ibb.co/X2mz2sk/default.jpg",
  },
  photoTitle: {
    type: String,
  },
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
