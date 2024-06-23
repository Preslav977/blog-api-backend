const express = require("express");

const router = express.Router();

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/user");

const verifyToken = require("../middleware/verifyToken");

router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.authData._id).exec();

    if (user === null) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    res.json(user);
  }),
);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const { _id } = req.user;

    jwt.sign(
      { _id },
      process.env.SECRET,
      { expiresIn: "25m" },
      (err, token) => {
        res.json({ token });
      },
    );
  },
);

router.post(
  "/login_verified",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const { _id, verified_status, admin } = req.user;

    jwt.sign(
      { _id, verified_status, admin },
      process.env.SECRET,
      { expiresIn: "25m" },
      (err, token) => {
        if (!verified_status || !admin) {
          res.json({ message: "Unauthorized" });
        }
        res.json({ token });
      },
    );
  },
);

router.post(
  "/login_test_user",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const { _id, test_user } = req.user;

    jwt.sign(
      { _id, test_user },
      process.env.SECRET,
      { expiresIn: "25m" },
      (err, token) => {
        res.json({ token });
      },
    );
  },
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

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
  body("first_name", "First_Name must be between 1 and 30 characters")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 30 })
    .escape(),
  body("last_name", "Last_Name must be between 3 and 30 characters")
    .trim()
    .isLength({ min: 3 })
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
        verified_status: false,
        admin: false,
        // test_user: true,
      });

      if (!errors.isEmpty()) {
        res.json({ message: "Failed to created user." });
      } else {
        const userEmailExists = await User.findOne({ email: req.body.email })
          .collation({ locale: "en", strength: 2 })
          .exec();

        if (userEmailExists) {
          res.json({ message: "Username with that email already exists." });
        } else {
          res.json({ message: "Successfully created user." });
          await user.save();
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
  body("first_name", "First_Name must be between 1 and 30 characters")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 30 })
    .escape(),
  body("last_name", "Last_Name must be between 3 and 30 characters")
    .trim()
    .isLength({ min: 3 })
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

      if (!errors.isEmpty()) {
        res.json({ message: "User not successfully updated." });
      } else {
        const updateUser = await User.findByIdAndUpdate(req.params.id, user);
        res.json(updateUser);
      }
    });
  }),
);

module.exports = router;
