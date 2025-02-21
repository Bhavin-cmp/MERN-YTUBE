import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.Models.js";

const registerUser = asyncHandler(async (req, res) => {
  //------------------------------------------------ STEPS TO REGISTER USERS -------------------------------------------------//
  /* 

      1. Get user details from frontend.
      2. Validate Data.
      3. Check if user already exist : userName,Email
      4. Check file is availabe or not for upload.
      5. Upload file on cloudinary.
      6. Create User Object - create User in DB.
      7. Remove Password and refresh Token field from response.
      8. Check for use Creation.
      9. Return Response if user create else return error.
  */

  const { userName, fullName, email, password } = req.body;
  console.log("response checking", userName, fullName, email, password);

  const errors = [];
  if (!userName || userName.trim() === "") errors.push("UserName Is required");
  if (!fullName || fullName.trim() === "") errors.push("FullName Is Required");
  if (!email || email.trim() === "") {
    errors.push("Email Is Required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid Email Format");
    }
  }
  if (!password || password.trim() === "") errors.push("password Is Required");
  if (errors.length > 0) {
    throw new ApiError(400, `Validation Errors:${errors.join(", ")}`);
  }

  // Checking User already exist or not
  const existUser = User.findOne({
    // here we are checking user already exist or not with email or userName
    $or: [{ userName }, { email }], //$or operator perform a logical operation on array, like we have created Object inside array
  });
  console.log("Database User", !existUser);
  if (!existUser) {
    throw new ApiError(
      409,
      "User with this Email or UserName already exist, Please use another or login"
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatarLocalPath Is not Availabel for upload");
  }

  console.log("Avatar Path", avatarLocalPath);
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Cloudinary upload error ");
  }

  const newUser = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select(
    // we are trying to find newUser from User Database
    "-password -refreshToken" // select is used to in response to remove sensitive field like password, refreshtoken
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user ");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {});

export { registerUser, loginUser };
