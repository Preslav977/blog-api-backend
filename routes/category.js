const express = require("express");

const router = express.Router();

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

const Category = require("../models/category");

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const category = await Category.find().sort({ title: 1 }).exec();

    res.json(category);
  }),
);

router.post(
  "/create",

  body("category", "Category must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const category = new Category({
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      const categoryExits = await Category.findOne({
        category: req.body.category,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (categoryExits) {
        res.json({ message: "Category already exists with that name." });
      } else {
        await category.save();
        res.json({ message: "Category has been created." });
      }
    }
  }),
);

module.exports = router;
