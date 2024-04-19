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
      const postTitleExists = await Post.findOne({ title: req.body.title })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (postTitleExists) {
        res.redirect("/");
      } else {
        await post.save();
        res.json(post);
      }
    }
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const allPosts = await Post.find()
      .sort({ title: 1 })
      .populate("category")
      .exec();

    res.json(allPosts);
  }),
);

router.get(
  "/post/:title",
  asyncHandler(async (req, res, next) => {
    const post = await Promise.all([
      Post.findOne({ title: req.params.title })
        .populate("category")
        // .populate("comments")
        .exec(),
    ]);

    console.log({ title: req.params.title });
    console.log(req.params.title);

    if (post === null) {
      const err = new Error("Post not found.");
      err.status = 404;
      return next(err);
    }
    res.json(post);
  }),
);

router.get("/category/:name", (req, res) => {
  // TODO: When the categories are created.
});

router.get(
  "/tag/:name",
  asyncHandler(async (req, res, next) => {
    const post = await Promise.all([
      Post.findOne({ tags: req.params.name })
        .populate("category")
        // .populate("comments")
        .exec(),
    ]);

    if (post === null) {
      const err = new Error("No posts have been found based on that tag.");
      err.status = 404;
      return next(err);
    }
    res.json(post);
  }),
);

router.get("/latest:/id", (req, res) => {
  // TODO: When you figure out how to make 10 posts on each page.
});

router.put(
  "/post/:id",

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
      _id: req.params.id,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      const updatePost = await Post.findByIdAndUpdate(req.params.id, post);
      res.json(updatePost);
    }
  }),
);

router.delete(
  "/post/:id",
  asyncHandler(async (req, res) => {
    const post = await Promise.all([
      Post.findById(req.params.id).populate("category").exec(),
    ]);

    if (post === null) {
      res.redirect("/");
    } else {
      await Post.findByIdAndDelete(req.params.id);
      res.json(post);
    }
  }),
);

module.exports = router;
