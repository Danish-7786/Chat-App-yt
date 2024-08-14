import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const options = {
  httpOnly: true,
  secure: true,
};


const signup = asyncHandler(async (req, res) => {
  const {fullName, username, email, password,gender} = req.body;
  if ([fullName,username, email, password,gender].some((field) => field?.trim() === "")) {
    throw new ApiError(404, "All the fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User Already exists !!");
  }
  const profilePicLocalPath = req.files?.profilePic[0]?.path;
  if (!profilePicLocalPath) {
    throw new ApiError(400, "Avatar is required multer");
  }
  const profilePic = await uploadOnCloudinary(profilePicLocalPath);
  if (!profilePic) {
    throw new ApiError(404, "ProfilePic is required");
  }

  const user = await User.create({
    profilePic: profilePic.url,
    username: username.toLowerCase(),
    email,
    gender,
    fullName,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res.status(201).json(new ApiResponse(200, createdUser));
});

const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out success"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if ([username, password].some((field) => field.trim() === "")) {
    throw new ApiError(404, "All fields are required");
  }
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new ApiError(404, "User with this username didn't exists");
  }
  const verifyPassword = await user.isPasswordCorrect(password);
  if (!verifyPassword) {
    throw new ApiError(404, "Wrong Password");
  }
  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
        "User Logged in success"
      )
    );
});

export { signup, logout, loginUser };
