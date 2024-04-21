const mongoose = require("mongoose");

const { Schema } = mongoose;

const PostModel = new Schema({
  title: { type: String, minLength: 5, maxLength: 80, required: true },
  author: { type: String, minLength: 5, maxLength: 80, required: true },
  date: { type: Date },
  body: { type: String, minLength: 5, maxLength: 300, required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: "Categories" }],
  tags: [{ type: String, minLength: 5, maxLength: 30, required: true }],
  image_link: { type: String, required: true },
  image_owner: { type: String, minLength: 5, maxLength: 30, required: true },
  image_source: { type: String, minLength: 5, maxLength: 30, required: true },
  privacy: { type: Boolean, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
});

module.exports = mongoose.model("Post", PostModel);
