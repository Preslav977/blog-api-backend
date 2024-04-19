const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  category: { type: String, minLength: 5, maxLength: 30, required: true },
});

module.exports = mongoose.model("Category", CategorySchema);
