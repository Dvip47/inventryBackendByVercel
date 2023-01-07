const asyncHandler = require("express-async-handler");
const User = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
  const { fname, lname, role, email, password } = req.body;

  //validation
  if (!fname || !lname || !role || !email || !password) {
    res.status(400);
    throw new Error("Fill all require feileds");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password never less than 6 characters");
  }

  //if admin already exist

  if (role == "admin") {
    const adminExist = await User.findOne({ role: "admin" });
    if (adminExist) {
      res.status(400);
      throw new Error("Admin already exist");
    }
  }

  //if user email already exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email already exist Please forgot password");
  }

  //create new user
  const user = await User.create({
    fname,
    lname,
    role,
    email,
    password,
  });
  //Generate token
  const token = generateToken(user._id);

  //Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, fname, lname, role, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      fname,
      lname,
      role,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user Data");
  }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //validate request
  if (!email || !password) {
    res.status(400);
    throw new Error("Fill all require feileds");
  }

  //check user exist
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("user not exist, firstly sign up");
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //Generate token
  const token = generateToken(user._id);

  //Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully logout" });
});

//get user
const getUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.user._id);
  const { _id, fname, lname, email, photo, phone, bio } = user;
  let data = await User.findById(req.user._id);
  res.status(201).json({ data });
  // if (user) {
  //   // console.log("user", user);
  //   console.log(_id, fname, lname, email, photo, phone, bio);

  //   res.status(201).json({
  //     _id,
  //     fname,
  //     lname,
  //     email,
  //     photo,
  //     phone,
  //     bio,
  //   });
  // } else {
  //   res.status(400);
  //   throw new Error("User not found");
  // }
});

//get all user
const alluser = asyncHandler(async (req, res) => {
  let data = await User.find({ role: { $ne: "Admin" } });
  res.status(201).json({ data });
});

//get all customer
const allCustomer = asyncHandler(async (req, res) => {
  let data = await User.find({
    role: { $eq: "Customer" },
  });
  res.status(201).json({ data });
});

//Login User
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  //Verify Token
  const Verified = jwt.verify(token, process.env.JWT_SECRET);

  if (Verified) {
    return res.json(true);
  }
  return res.json(false);
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//Change Password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;
  if (!user) {
    res.status(400);
    throw new Error("User Not found,Sighn up");
  }
  //validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Fill old and new password");
  }

  //check if old password is match from DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  //save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password Change successful" });
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User does not exist");
  }
  //Create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  //Hash TOken before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hext");

  //save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createAt: Date.now(),
    expireAt: Date.now() + 30 * (60 * 100), // 30 Mintus
  }).save();

  //Construct reset Url

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset email
  const message = `
<h2>Hello ${user.name}</h2>
<p>We received a request to reset the password associated with this email address.

If you made this request, please follow the instructions below.

If you did not request to have your password reset you can safely ignore this email. Be assured your account is safe.

Click the link below to go to the last step to reset your password:</p>
<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
<p>Regard...</p>
<p>RoundPay Technical Team</p>
  `;
  const subject = "Password Reset Request";
  const sent_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, sent_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email sent" });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Email not send, Try Again");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  alluser,
  allCustomer,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
};
