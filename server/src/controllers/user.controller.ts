import asyncHandler from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import { createActivationToken } from "../utils/generateActiveationToken";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import ApiResponse from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken";
import axios from "axios";

// create new user
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //     Fields: First Name, Last Name, email, country, phone Number
    const { first_name, last_name, email, country, phone_number, password } =
      req.body;
    console.log("body");
    if (
      !first_name ||
      !last_name ||
      !email ||
      !country ||
      !phone_number ||
      !password
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // check if the user already exists
    const user = await User.findOne({ email });
    console.log("user");
    if (user) {
      throw new ApiError(400, "User already exists");
    }

    const userData = {
      first_name,
      last_name,
      email,
      country,
      phone_number,
      password,
    };
    console.log("userData");
    // Generate activation token
    const activationToken = createActivationToken(userData);
    const activationUrl = `http://localhost:3000/activation/${activationToken}`;
    console.log("activationUrl");
    const data = {
      user: {
        name: userData.first_name,
      },
      activationUrl,
    };
    console.log("data");
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/activation.link.ejs"),
      data
    );
    console.log("html");
    try {
      await sendMail({
        email: userData.email,
        subject: "Activate your account",
        template: "activation.link.ejs",
        data,
      });
      return res
        .status(201)
        .json(
          new ApiResponse(200, `Please check your email: ${userData.email}`)
        );
    } catch (error: any) {
      console.log(error);
      throw new ApiError(500, error.message, error);
    }
  }
);

// verify Captcha
export const verifyCaptcha = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { captchaToken } = req.body;
    if (!captchaToken) {
      throw new ApiError(400, "All fields are required");
    }
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${captchaToken}`
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Captcha verified successfully.", data));
  }
);

// Activate User
export const activateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token } = req.params;

    const newUser = jwt.verify(
      activation_token as string,
      process.env.ACTIVATION_TOKEN_SECRET!
    );
    console.log("verify JWT token");

    if (!newUser) {
      throw new ApiError(400, "Invalid token");
    }

    const { first_name, last_name, email, country, phone_number, password } =
      newUser as {
        first_name: string;
        last_name: string;
        email: string;
        country: string;
        phone_number: string;
        password: string;
      };
    console.log("destructure the data");

    let user = await User.findOne({ email });

    if (user) {
      throw new ApiError(400, "User already exist");
    }

    user = await User.create({
      first_name,
      last_name,
      email,
      country,
      phone_number,
      password,
      isVerified:true
    });

    sendToken(user, 201, res, "user account activated successfully");
  }
);

// Login user
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(400, "Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ApiError(400, "Invalid credentials");
    }

    sendToken(user, 200, res, "User Login Success");
  }
);

// Load user
export const loadUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id } = req.user;
    const user = await User.findById(id);
    console.log("user", user);
    if (!user) {
      console.log("Error");
      throw new ApiError(400, "User doesn't exist.");
    }
    console.log("user fetched.");

    return res.status(200).json(new ApiResponse(200, "user fetched.", user));
  }
);

// logout the user
export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Successfully logged out.", null));
  }
);

// User: update user profile
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { id } = req.user;
    const { first_name, last_name, email, country, phone_number } = req.body;
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.country = country;
    user.phone_number = phone_number;
    await user.save();
    res
      .status(200)
      .json(new ApiResponse(200, "User profile updated successfully.", user));
  }
);

// User: reset password
export const resetPasswordRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }

    // Generate reset password token
    // @ts-ignore
    const token = user.passwordResetToken();
    console.log("Reset Password Token", token);
    const resetUrl = `http://localhost:3000/reset/${token}`;
    const data = {
      user: {
        name: user.first_name,
      },
      resetUrl,
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/reset.link.ejs"),
      data
    );
    try {
      await sendMail({
        email: user.email,
        subject: "Reset your password",
        template: "reset.link.ejs",
        data,
      });
      return res
        .status(201)
        .json(new ApiResponse(200, `please check your email:- ${user.email}`));
    } catch (error: unknown) {
      // Use instance check to make sure error is an instance of Error
      if (error instanceof Error) {
        console.log(error);
        // @ts-ignore
        throw new ApiError(500, error.message, error);
      } else {
        // Handle cases where the error is not an instance of Error (could be a string, etc.)
        console.log("Unknown error:", error);
        // @ts-ignore
        throw new ApiError(500, "An unknown error occurred", error);
      }
    }
  }
);

// Reset Password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { new_password } = req.body;
    if (!new_password) {
      throw new ApiError(400, "All fields are required");
    }

    const decoded = jwt.verify(
      token,
      process.env.PASSWORD_RESET_TOKEN_SECRET!
    ) as { id: string };
    console.log(decoded, "Decoded Data Log");
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Check if the reset token has expired
    if (new Date() > new Date(user.resetPasswordTime!)) {
      return res.status(400).json({
        success: false,
        message: "Password reset token has expired",
      });
    }

    user.password = new_password;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordTime = undefined;
    await user.save();
    res
      .status(200)
      .json(new ApiResponse(200, "Password reset successful", user));
  }
);

// Admin : show all users
export const showAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json(new ApiResponse(200, "All users fetched.", users));
  }
);

// Admin : update user
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { first_name, last_name, email, country, phone_number } = req.body;

    if (!first_name || !last_name || !email || !country || !phone_number) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.country = country;
    user.phone_number = phone_number;

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully.", user));
  }
);

// Admin : delete user
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }

    await user.deleteOne();

    res
      .status(200)
      .json(new ApiResponse(200, "User deleted successfully.", user));
  }
);

// Admin: change user password
export const changeUserPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new ApiError(400, "All fields are required");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(400, "User doesn't exist.");
    }

    user.password = password;

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, "Password changed successfully.", user));
  }
);
