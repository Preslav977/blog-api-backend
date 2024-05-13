const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");

const uploadFile = multer({ dest: "./public/storage" });
const cloudinary = require("cloudinary").v2;
const fs = require("node:fs");

const router = express.Router();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const Category = require("../models/category");
const Comment = require("../models/comments");

router.get(
  "/posts",
  asyncHandler(async (req, res, next) => {
    const posts = await Post.find()
      .sort({ title: 1 })
      .populate("author")
      .populate("category")
      .populate({ path: "comments", populate: { path: "user" } })
      .exec();

    res.json(posts);
  }),
);

router.get(
  "/posts/:id",

  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
      .populate("author")
      .populate("category")
      .populate({ path: "comments", populate: { path: "user" } })
      .exec();

    if (post === null) {
      const err = new Error("Post not found.");
      err.status = 404;
      return next(err);
    }
    res.json(post);
  }),
);

router.get(
  "/posts/:id/category",

  asyncHandler(async (req, res, next) => {
    const post = await Post.find({ category: req.params.id })
      .populate("author")
      .populate("category")
      .populate({ path: "comments", populate: { path: "user" } })
      .exec();

    console.log(post);
    if (post === null) {
      const err = new Error("Post not found.");
      err.status = 404;
      return next(err);
    }
    res.json(post);
  }),
);

router.get(
  "/posts/tag/:name",
  asyncHandler(async (req, res, next) => {
    const post = await Post.find({ tags: req.params.name })
      .populate("author")
      .populate("category")
      .populate({ path: "comments", populate: { path: "user" } })
      .exec();

    if (post === null) {
      const err = new Error("No posts have been found based on that tag.");
      err.status = 404;
      return next(err);
    }
    res.json(post);
  }),
);

router.get("/posts/latest/:id", (req, res) => {
  // TODO: When you figure out how to make 10 posts on each page.
});

router.post(
  "/posts",
  uploadFile.single("uploaded_file"),
  verifyToken,

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
  body("body", "Body must be between 5 and 50000 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 50000 })
    .escape(),
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

    // const byteArrayBuffer = fs.readFileSync(
    //   `./public/storage/${req.file.filename}`,
    // );

    // const uploadResult = await new Promise((resolve) => {
    //   cloudinary.uploader
    //     .upload_stream((error, uploadResult) => resolve(uploadResult))
    //     .end(byteArrayBuffer);
    // });

    const post = new Post({
      title: req.body.title,
      author: req.body.author,
      date: new Date(),
      body: req.body.body,
      category: [],
      tags: req.body.tags,
      image_link: req.body.image_link,
      image_owner: req.body.image_owner,
      image_source: req.body.image_source,
      privacy: req.body.privacy,
      comments: [],
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      const postTitleExists = await Post.findOne({ title: req.body.title })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (postTitleExists) {
        res.json({ message: "Post already exists with that title." });
      } else {
        await post.save();
        res.json(post);
      }
    }
  }),
);

router.post(
  "/posts/category/:name",
  verifyToken,

  body("category", "Category must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.find({ name: req.params.name }).exec();

    const category = new Category({
      category: req.body.category,
    });

    console.log(category);

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors.array());
    } else {
      post.category.push(category);
      await category.save();
      await post.save();
      res.json(post);
    }
  }),
);

router.post(
  "/posts/:id/comments",
  verifyToken,

  body("content", "Content must be between 5 and 100 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 100 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      like: 0,
      user: req.body.user,
      hidden: false,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors.array());
    } else {
      const checkIfSameCommentExists = await Comment.findOne({
        content: req.body.content,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (checkIfSameCommentExists) {
        res.json({ message: "Comment with this content already exists" });
      } else {
        post.comments.push(comment);
        await comment.save();
        await post.save();
        res.json(post);
      }
    }
  }),
);

router.put(
  "/posts/:id",
  uploadFile.single("uploaded_file"),
  verifyToken,

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
  body("body", "Body must be between 5 and 50000 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 50000 })
    .escape(),
  body("category", "Category must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),
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

    // const byteArrayBuffer = fs.readFileSync(
    //   `./public/storage/${req.file.filename}`,
    // );

    // const uploadResult = await new Promise((resolve) => {
    //   cloudinary.uploader
    //     .upload_stream((error, uploadResult) => resolve(uploadResult))
    //     .end(byteArrayBuffer);
    // });

    const post = new Post({
      title: req.body.title,
      author: req.body.author,
      date: new Date(),
      body: req.body.body,
      category: [],
      tags: req.body.tags,
      image_link: req.body.image_link,
      image_owner: req.body.image_owner,
      image_source: req.body.image_source,
      privacy: req.body.privacy,
      comments: [],
      _id: req.params.id,
    });

    const category = new Category({
      category: req.body.category,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors);
    } else {
      post.category.push(category);
      const updatePost = await Post.findByIdAndUpdate(req.params.id, post);
      res.json(updatePost);
    }
  }),
);

router.put(
  "/posts/:id/comments/:commentId",
  verifyToken,

  body("content", "Content must be between 5 and 100 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 100 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      like: 0,
      _id: req.params.commentId,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      console.log(errors.array());
    } else {
      await Post.findByIdAndUpdate(req.params.commentId, comment);
      await Comment.findByIdAndUpdate(req.params.commentId, comment);
      res.json(post);
    }
  }),
);

router.delete(
  "/posts/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const post = await Promise.all([
      Post.findById(req.params.id)
        .populate("author")
        .populate("category")
        .populate("comments")
        .exec(),
    ]);

    if (post === null) {
      res.redirect("/");
    } else {
      await Post.findByIdAndDelete(req.params.id);
      res.json(post);
    }
  }),
);

router.delete(
  "/posts/:id/comment/:commentId",
  verifyToken,

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      hidden: true,
      _id: req.params.commentId,
    });

    if (!errors.isEmpty()) {
      console.log(errors.array());
    } else {
      await Post.findByIdAndUpdate(req.params.commentId, comment);
      await Comment.findByIdAndUpdate(req.params.commentId, comment);
    }
    res.json(post);
  }),
);

module.exports = router;
