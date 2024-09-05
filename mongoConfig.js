const mongoose = require("mongoose");
require("dotenv").config();

const mongoDB = process.env.DATABASE_URL;

mongoose.connect(mongoDB);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "mongo connection error"));
