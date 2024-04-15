const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  category: { type: String, minLength: 5, maxLength: 39, required: true },
});

module.exports = mongoose.model("Category", CategorySchema);
