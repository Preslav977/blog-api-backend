const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, minLength: 5, maxLength: 30, required: true },
  username: { type: String, minLength: 5, maxLength: 30, required: true },
  first_name: { type: String, minLength: 5, maxLength: 30, required: true },
  last_name: { type: String, minLength: 5, maxLength: 30, required: true },
  password: { type: String, minLength: 8, maxLength: 30, required: true },
  confirm_password: {
    type: String,
    minLength: 8,
    maxLength: 30,
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
