import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import User from "../models/userModels.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// Function to generate JWT token
const generatetoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

export const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password ,role} = req.body;
    console.log(name,email,password,role);
    if (!name || !email || !password || !role){
      res.status(400);
      throw new Error("Not all info found");
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400).json({
        message: "User already exists"
      })
     
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedpassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedpassword ,role});

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pic: user.pic,
        token: generatetoken(user._id), // Generate and include token
        message: "User created"
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the user");
    }
  } catch (error) {
    next(error); 
  }
});

export const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generatetoken(user._id),
        role: user.role,
        // Generate and include token
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error); 
  }
});
