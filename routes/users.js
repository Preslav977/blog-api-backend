const express = require("express");

const router = express.Router();

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/user");

const verifyToken = require("../middleware/verifyToken");

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const { loggedUser } = req;

    console.log(loggedUser);

    jwt.sign(
      { loggedUser },
      process.env.SECRET,
      { expiresIn: "10m" },
      (err, token) =>
        // const bearerArrayToken = ["Bearer", token];

        // localStorage.setItem("token", token);

        res.json({
          token,
        }),
    );
  },
);

router.post(
  "/signup",

  body("email", "Email must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("email").isEmail().withMessage("Not a valid e-mail address"),
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
  body("password", "Password must be at least 8 characters long.").isLength({
    min: 8,
  }),
  body("confirm_password", "Passwords don't match").custom(
    (value, { req }) => value === req.body.password,
  ),

  asyncHandler(async (req, res) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        console.log(err);
      }

      const errors = validationResult(req);

      const user = new User({
        email: req.body.email,
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hashedPassword,
        confirm_password: hashedPassword,
      });

      console.log(user);

      if (!errors.isEmpty()) {
        console.log(errors);
      } else {
        const userEmailExists = await User.findOne({ email: req.body.email })
          .collation({ locale: "en", strength: 2 })
          .exec();

        if (userEmailExists) {
          res.json({ message: "Username with that email already exists." });
        } else {
          await user.save();
          res.json(user);
        }
      }
    });
  }),
);

router.put(
  "/:id",
  verifyToken,

  body("email", "Email must be between 5 and 30 characters")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("email").isEmail().withMessage("Not a valid e-mail address"),
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
  body("password", "Password must be at least 8 characters long.").isLength({
    min: 8,
  }),
  body("confirm_password", "Passwords don't match").custom(
    (value, { req }) => value === req.body.password,
  ),

  asyncHandler(async (req, res) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        console.log(err);
      }

      const errors = validationResult(req);

      const user = new User({
        email: req.body.email,
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hashedPassword,
        confirm_password: hashedPassword,
        _id: req.params.id,
      });

      console.log(user);

      if (!errors.isEmpty()) {
        console.log(errors);
      } else {
        const updateUser = await User.findByIdAndUpdate(req.params.id, user);
        res.json(updateUser);
      }
    });
  }),
);

module.exports = router;
