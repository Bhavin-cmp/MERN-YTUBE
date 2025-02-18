import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //Cloudinaty URL of the image
      required: true,
    },
    coverImage: {
      type: String, //Cloudinaty URL of the image
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // If the password is not modified, skip this middleware.
  this.password = bcrypt.hashSync(this.password, 10); // Hash the password before saving the user model.
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  // Compare the password sent by the user with the hashed password stored in the database.
  return await bcrypt.compare(password, this, password);
};
// Generate JWT token for the user
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    // Generate a JWT token with the user ID and email address.
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // Use the ACCESS_TOKEN_SECRET to sign the JWT token.
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  // Generate a refresh token for the user.
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
