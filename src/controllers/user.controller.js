import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.Models.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Add refresh token in user Object
    user.refreshToken = refreshToken;
    // Saving resresh token in database
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went wrong while generating refresh and access tokens"
    );
  }
};

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
  // console.log("response checking", userName, fullName, email, password);

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
  // console.log("Database User", !existUser);
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

  // console.log("Avatar Path", avatarLocalPath);
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

const loginUser = asyncHandler(async (req, res) => {
  /* =============Steps To Login User================ */
  /* 
  1. Fetch User Login detail email and password.
  2. Check {email or userName} and password are not empty.
  3. Find the user
  4. Password Check
  5. access and resresh token generate
  6. send token in cookies

  */

  const { email, userName, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "UserName or Email Is required");
  }

  // Here is an alternative of above code based on logic
  /*   if (!(userName || email)) {
    throw new ApiError(400, "UserName or Email is required");
  } */

  // Now find user with email or userName
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "User with this email or username does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  //Generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut Successfully "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "UnAuthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Is Expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("acceessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access Token Refresh Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || " Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Feetched Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All Fields Are Required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File Is Missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error While Uploading on avatar File");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));

  //Delete old avatar
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image File Is Missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error While Uploading on CoverImage File");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage Updated Successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
