const mongoose = require("mongoose");

const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: { type: String, minLength: 5, maxLength: 100, required: true },
  date: { type: Date },
  like: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Comments", CommentSchema);
