const express = require("express");

const router = express.Router();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");

router.post(
  "/create",

  body("title", "Title must be between 5 and 80 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 80 })
    .escape(),
  body("author", "Author must be between 5 and 80 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 80 })
    .escape(),
  body("body", "Body must be between 5 and 300 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 300 })
    .escape(),
  //   body("category", "Category must be between 5 and 30 characters long.")
  //     .trim()
  //     .isLength({ min: 5 })
  //     .isLength({ max: 30 })
  //     .escape(),
  body("tags", "Tags must be 5 and 80 characters and 30 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("image_owner", "Image_Owner must be between 5 and 30 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),
  body("image_source", "Image_Source must be between 5 and 30 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 30 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      author: req.body.author,
      date: new Date(),
      body: req.body.body,
      category: req.body.category,
      tags: req.body.tags,
      image_link: req.body.image_link,
      image_owner: req.body.image_owner,
      image_source: req.body.image_source,
      privacy: req.body.privacy,
      comments: req.body.comments,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      await post.save();
      res.json(post);
    }
  }),
);

// router.get("/post/:name", (req, res) => {
//   res.send(`GET HTTP post name request ${req.params.name}`);
// });

// router.get("/category/:name", (req, res) => {
//   res.send(`GET HTTP post category name request ${req.params.name}`);
// });

// router.get("/tag/:name", (req, res) => {
//   res.send(`GET HTTP post tag name request ${req.params.name}`);
// });

// router.get("/latest:/id", (req, res) => {
//   res.send(`GET HTTP post latest post page number request ${req.params.id}`);
// });

module.exports = router;
