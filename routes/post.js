const express = require("express");

const router = express.Router();

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

const verifyToken = require("../middleware/verifyToken");

const Post = require("../models/post");

const Category = require("../models/category");

const Comment = require("../models/comments");

// const upload = multer({ dest: "./public/data/uploads" });

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
  "/posts/category/:id",
  asyncHandler(async (req, res, next) => {
    const post = await Post.find({ category: req.params.id })
      .populate({ path: "category", populate: { path: "category" } })
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
  "/posts/tag/:name",
  asyncHandler(async (req, res, next) => {
    const post = await Post.find({ tags: req.params.name })
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

// TODO: Figure out how to send from frontend to backend the image

router.post(
  "/posts",
  verifyToken,
  // upload.single("image_link"),

  body("title", "Title must be between 5 and 80 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 80 })
    .escape(),
  body("author").escape(),
  body("body", "Body must be between 5 and 50000 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 50000 }),
  // .escape(),
  body("tags", "Tags must be 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),
  body("image_owner", "Image_Owner must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),
  body("image_source", "Image_Source must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    // const byteArrayBuffer = fs.readFileSync(
    //   `./public/data/uploads/${req.file.filename}`,
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

    if (!errors.isEmpty()) {
      res.json({
        message: "Failed to create a post the constrains are not met.",
      });
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
  "/posts/:id/category/",
  verifyToken,

  body("category", "Category must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.body.id).exec();

    const category = new Category({
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      res.json({ message: "Failed to created the post with a category" });
    } else {
      const postCategoryExists = await Category.findOne({
        category: req.body.category,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (postCategoryExists) {
        post.category.push(postCategoryExists);
        await post.save();
        res.json(post);
      } else {
        post.category.push(category);
        await category.save();
        await post.save();
        res.json(post);
      }
    }
  }),
);

router.post(
  "/posts/:id/comments/",
  verifyToken,

  body("content", "Content must be between 5 and 100 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 100 })
    .escape("-"),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      content: req.body.content,
      date: new Date(),
      user: req.authData._id,
    });

    if (!errors.isEmpty()) {
      res.json({
        message: "Failed to create a comment the constrains are not met.",
      });
    } else {
      post.comments.push(comment);
      await comment.save();
      await post.save();
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
  verifyToken,

  body("title", "Title must be between 5 and 80 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 80 })
    .escape(),
  body("author").escape(),
  body("body", "Body must be between 5 and 50000 characters long.")
    .trim()
    .isLength({ min: 5 })
    .isLength({ max: 50000 }),
  // .escape(),
  // body("category", "Category must be between 3 and 30 characters long.")
  //   .trim()
  //   .isLength({ min: 3 })
  //   .isLength({ max: 30 })
  //   .escape(),
  body("tags", "Tags must be 3 and 30 characters and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),
  body("image_owner", "Image_Owner must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
    .isLength({ max: 30 })
    .escape(),
  body("image_source", "Image_Source must be between 3 and 30 characters long.")
    .trim()
    .isLength({ min: 3 })
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

    if (!errors.isEmpty()) {
      res.json({
        message: "Failed to update the post the constrains are not met.",
      });
    } else {
      post.category.push(category);
      await Post.findByIdAndUpdate(req.params.id, post);
      res.json(post);
    }
  }),
);

router.put(
  "/post/:id",
  verifyToken,

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ message: "Failed to update the post privacy." });
    } else {
      const post = await Post.updateOne(
        { _id: req.body.id },
        { $set: { privacy: req.body.privacy } },
      );
      res.json(post);
    }
  }),
);

// TODO: Using updateOne and set operator to make updating only the comment content

router.put(
  "/posts/:id/comments/",
  verifyToken,

  // body("content", "Content must be between 5 and 100 characters long.")
  //   .trim()
  //   .isLength({ min: 5 })
  //   .isLength({ max: 100 })
  //   .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      // content: req.body.content,
      // date: new Date(),
      like: req.body.like,
      _id: req.body.id,
    });

    if (!errors.isEmpty()) {
      res.json({ message: "Failed to update the comment." });
    } else {
      await Post.findByIdAndUpdate(req.body.id, comment);
      await Comment.findByIdAndUpdate(req.body.id, comment);
      res.json(comment);
    }
  }),
);

router.delete(
  "/posts/:id",
  verifyToken,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.body.id)
      .populate("author")
      .populate("category")
      .populate("comments")
      .exec();

    if (post === null) {
      res.redirect("/");
    } else {
      await Post.findByIdAndDelete(req.body.id);
      // res.json(post);
      res.json({ message: "Post has been deleted." });
    }
  }),
);

router.delete(
  "/posts/:id/comment/",
  verifyToken,

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id).exec();

    const comment = new Comment({
      hidden: true,
      _id: req.body.id,
    });

    if (!errors.isEmpty()) {
      res.json({ message: "Failed to delete the comment." });
    } else {
      await Post.findByIdAndUpdate(req.body.id, comment);
      await Comment.findByIdAndUpdate(req.body.id, comment);
    }
    res.json({ message: "Comment has been deleted." });
  }),
);

module.exports = router;
