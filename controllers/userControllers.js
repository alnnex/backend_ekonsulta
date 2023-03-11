const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    pic,
    psychologist,
    psychSecret,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all Fields!");
  }
  if (psychologist === true) {
    if (psychSecret !== process.env.PSYCH_SECRET) {
      res.status(400);
      throw new Error("Invalid authorization key!");
    }
  }
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists!");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    pic,
    psychologist,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pic: user.pic,
      psychologist: user.psychologist,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user!");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      pic: user.pic,
      psychologist: user.psychologist,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password!");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .sort({ psychologist: -1, firstName: 1 })
    .select("-password");
  res.send(users);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { pic, firstName, lastName } = req.body;

  const updateProfile = await User.findByIdAndUpdate(req.user._id, {
    firstName: firstName,
    lastName: lastName,
    pic: pic,
  });
  if (!updateProfile) {
    res.status(404);
    throw new Error("User Not Found!");
  } else {
    res.json(updateProfile);
  }
});

module.exports = { registerUser, authUser, allUsers, updateProfile };
