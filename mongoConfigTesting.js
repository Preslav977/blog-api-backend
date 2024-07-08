const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Post = require("./models/post");

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
      _id: "666ab1666f79c72c01496e8d",
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

    const userVerified = new User({
      _id: "666ab1666f79c72c01496e8b",
      email: "testing@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "testing",
      password: hashedPassword,
      confirm_password: hashedPassword,
      verified_status: true,
      admin: true,
    });

    await userVerified.save();

    const testUser = new User({
      _id: "666ab1666f79c72c01496e8c",
      email: "testing2@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "testing",
      password: hashedPassword,
      confirm_password: hashedPassword,
      test_user: true,
    });

    await testUser.save();
  });

  const firstPost = new Post({
    _id: "666a851f024b1c34ece39586",
    title: "my first post",
    author: "666ab1666f79c72c01496e8b",
    date: "06-07-2024",
    body: "random stuff",
    category: [],
    tags: ["bla", "test", "wow"],
    image_link: "somewhere else",
    image_owner: "whawtat",
    image_source: "wowwwow",
    privacy: false,
    comments: [],
  });

  await firstPost.save();

    const secondPost = new Post({
    _id: "666a851f024b1c34ece39582",
    title: "my first post",
    author: "666ab1666f79c72c01496e8b",
    date: "06-07-2024",
    body: "random stuff",
    category: [{
      category: "testing", _id: "668b829c383c372fc836463f"
    }],
    tags: ["bla", "test", "wow"],
    image_link: "somewhere else",
    image_owner: "whawtat",
    image_source: "wowwwow",
    privacy: false,
    comments: [],
  });

  await secondPost.save();
}

module.exports = initializeMongoServer;
