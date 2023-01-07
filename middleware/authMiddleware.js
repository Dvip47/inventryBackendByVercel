const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorize,please login");
    }

    //Verify Token
    const Verified = jwt.verify(token, process.env.JWT_SECRET);
    //Get  user id from token
    const user = await User.findById(Verified.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorize,please login");
  }
});

module.exports = protect;
