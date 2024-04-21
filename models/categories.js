const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  category: { type: String, minLength: 3, maxLength: 30, required: true },
});

module.exports = mongoose.model("Categories", CategorySchema);
