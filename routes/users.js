const express = require("express");

const router = express.Router();

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

router.get("/account", (req, res) => {
  res.send("GET HTTP account request");
});

router.post("/account/login", (req, res) => {
  res.send("POST HTTP account login request");
});

router.post(
  "/signup",

  body("email", "Email must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("email").isEmail().withMessage("Not a valid e-mail address"),
  // body("email")
  //   .isEmail()
  //   .custom(async (value) => {
  //     const existingUserEmail = await User.findByEmail(value);
  //     if (existingUserEmail) {
  //       throw new Error("A user already exists with this e-mail address");
  //     }
  //   }),
  body("username", "Username must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("first_name", "First_Name must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("last_name", "Last_Name must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("password", "Password must be between 8 and 30 characters long.")
    .isLength({ min: 8 })
    .isLength({ max: 30 }),
  body("confirm_password", "Passwords don't match").custom(
    (value, { req }) => value === req.body.password,
  ),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const user = new User({
      email: req.body.email,
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
    });

    console.log(user);

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      await user.save();
      res.json(user);
    }
  }),
);

module.exports = router;
