const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("./models/user");

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  mongoose.connect(mongoUri);

  mongoose.connection.on("error", (e) => {
    if (e.message.code === "ETIMEDOUT") {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });

  bcrypt.hash("12345678", 10, async (err, hashedPassword) => {
    if (err) {
      console.log(err);
    }

    const user = new User({
      email: "testing1@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "testing",
      password: hashedPassword,
      confirm_password: hashedPassword,
      verified_status: false,
      admin: false,
    });

    await user.save();
  });
}

module.exports = initializeMongoServer;
