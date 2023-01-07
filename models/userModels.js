const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      require: [true, "Please fill first name"],
    },
    lname: {
      type: String,
      require: [true, "Please fill last name"],
    },
    role: {
      type: String,
      require: [true, "Please fill role"],
    },
    email: {
      type: String,
      require: [true, "Please fill email"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        "Please enter valid email",
      ],
    },
    password: {
      type: String,
      require: [true, "Please fill password"],
      minLength: [6, "Password must be more than 6 character"],
      //   maxLength: [32, "Password must be up to 32 character"],
    },
    photo: {
      type: String,
      require: [true, "Please chhose any photo"],
      default: "https://i.ibb.co/4pDNDk1/avtar.png",
    },
    phone: {
      type: Number,
      default: "+91",
    },
    bio: {
      type: String,
      maxLength: [250, "Bio not more than 250 character"],
      default: "bio",
    },
  },
  {
    timestamps: true,
  }
);

//Encrypt Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
