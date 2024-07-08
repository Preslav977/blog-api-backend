require("dotenv").config();

const request = require("supertest");

const express = require("express");

const LocalStrategy = require("passport-local").Strategy;

const passport = require("passport");

const session = require("express-session");

const bcrypt = require("bcrypt");

const User = require("../models/user");

const postsRouter = require("../routes/post");

const userRouter = require("../routes/users");

const initializeMongoServer = require("../mongoConfigTesting");

const app = express();

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        // console.log(user);
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        const match = await bcrypt.compare(password, user.password);
        // console.log(match);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        // console.log(err);
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    // console.log(user);
    done(null, user);
  } catch (err) {
    // console.log(err);
    done(err);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", postsRouter);

describe("testing the post routes and controllers", (done) => {
  beforeAll(() => initializeMongoServer());

  afterAll(() => done);

  test("testing if pre-created post can be fetched", async () => {
    const response = await request(app)
      .get("/posts")
      .set("Accept", "application/json");

    // console.log(response.body[0]);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);

    expect(response.body[0]._id).toEqual(response.body[0]._id);

    expect(response.body[0].title).toBe("my first post");

    expect(response.body[0].date).toBe("2024-06-06T21:00:00.000Z");

    expect(response.body[0].tags[0]).toBe("bla");

    expect(response.body[0].tags[1]).toBe("test");

    expect(response.body[0].tags[2]).toBe("wow");

    expect(response.body[0].image_link).toBe("somewhere else");

    expect(response.body[0].image_owner).toBe("whawtat");

    expect(response.body[0].image_source).toBe("wowwwow");

    expect(response.body[0].comments).toEqual([]);
  });

  test("testing if post it is fetched by an id", async () => {
    const response = await request(app)
      .get("/posts/666a851f024b1c34ece39586")
      .set("Accept", "application/json");

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);

    expect(response.body.id).toEqual(response.body.id);

    expect(response.body.title).toBe("my first post");

    expect(response.body.date).toBe("2024-06-06T21:00:00.000Z");

    expect(response.body.tags[0]).toBe("bla");

    expect(response.body.tags[1]).toBe("test");

    expect(response.body.tags[2]).toBe("wow");

    expect(response.body.image_link).toBe("somewhere else");

    expect(response.body.image_owner).toBe("whawtat");

    expect(response.body.image_source).toBe("wowwwow");

    expect(response.body.comments).toEqual([]);
  });

  test("testing if post it is fetched by tag name", async () => {
    const response = await request(app)
      .get("/posts/tag/bla")
      .set("Accept", "application/json");

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);

    expect(response.body[0]._id).toEqual(response.body[0]._id);

    expect(response.body[0].title).toBe("my first post");

    expect(response.body[0].date).toBe("2024-06-06T21:00:00.000Z");

    expect(response.body[0].tags[0]).toBe("bla");

    expect(response.body[0].tags[1]).toBe("test");

    expect(response.body[0].tags[2]).toBe("wow");

    expect(response.body[0].image_link).toBe("somewhere else");

    expect(response.body[0].image_owner).toBe("whawtat");

    expect(response.body[0].image_source).toBe("wowwwow");

    expect(response.body[0].comments).toEqual([]);
  });

  test("adding a category to the post if the token is received", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts/666a851f024b1c34ece39586/category")
      .send({ id: "666a851f024b1c34ece39586", category: "art" })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.category[0].id).toEqual(response.body.category[0].id);
    expect(response.body.category[0].category).toBe("art");
  });

  test("creating the post if the token is present and title constrains are met", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "random stuff",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["bla", "test", "wow"],
        image_link: "somewhere else",
        image_owner: "whawtat",
        image_source: "wowwwow",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a post the constrains are not met.",
    );
  });

  test("creating the post if the token is present body constraints are met", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "test",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["bla", "test", "wow"],
        image_link: "somewhere else",
        image_owner: "whawtat",
        image_source: "wowwwow",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a post the constrains are not met.",
    );
  });

  test("creating the post if the token is present tags constraints are met", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["ok"],
        image_link: "somewhere else",
        image_owner: "whawtat",
        image_source: "wowwwow",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a post the constrains are not met.",
    );
  });

  test("creating the post if the token is present image_owner constraints are met", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "",
        image_source: "wowwwow",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a post the constrains are not met.",
    );
  });

  test("creating the post if the token is present image_source constraints are met", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a post the constrains are not met.",
    );
  });

  test("testing if the post is created", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.status).toBe(200);
  });

  test("testing if you can't create the same post title", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts")
      .send({
        title: "my second post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe("Post already exists with that title.");
  });

  test("constraints of the comment must be met in order to comment on a post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts/666a851f024b1c34ece39586/comments")
      .send({ content: "test", user: "666ab1666f79c72c01496e8b" })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to create a comment the constrains are not met.",
    );
  });

  test("testing if a comment has been created", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts/666a851f024b1c34ece39586/comments")
      .send({ content: "testing", user: "666ab1666f79c72c01496e8b" })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.status).toBe(200);
  });

  test("testing if the same comment has been created", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .post("/posts/666a851f024b1c34ece39586/comments")
      .send({ content: "testing", user: "666ab1666f79c72c01496e8b" })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Comment with this content already exists",
    );
  });

  test("testing if the title constrain is met to update the post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to update the post the constrains are not met.",
    );
  });

  test("testing if the body constrain is met to update the post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "post!",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "test",
        category: [
          {
            category: "category",
            _id: "668b829c383c372fc836463f",
          },
        ],
        tags: ["test"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to update the post the constrains are not met.",
    );
  });

  test("testing if the tags constrain is met to update the post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "post!",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [],
        tags: ["hi"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to update the post the constrains are not met.",
    );
  });

  test("testing if the image_owner constrain is met to update the post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "post!",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [],
        tags: ["hello"],
        image_link: "somewhere else",
        image_owner: "",
        image_source: "awdwadwa",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to update the post the constrains are not met.",
    );
  });

  test("testing if the image_source constrain is met to update the post", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "post!",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "testing",
        category: [],
        tags: ["hello"],
        image_link: "somewhere else",
        image_owner: "image",
        image_source: "",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "Failed to update the post the constrains are not met.",
    );
  });

  test("testing if the post has been updated", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .put("/posts/666a851f024b1c34ece39586")
      .send({
        title: "new post",
        author: "666ab1666f79c72c01496e8b",
        date: "08-07-2024",
        body: "my new post",
        category: [],
        tags: ["history"],
        image_link: "link to somewhere",
        image_owner: "image",
        image_source: "unsplash",
        privacy: false,
        comments: [],
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.title).toBe("new post");
    expect(response.body.author).toBe("666ab1666f79c72c01496e8b");
    expect(response.body.date).toBe(response.body.date);
    expect(response.body.category[0].id).toBe(response.body.category[0].id);
    expect(response.body.tags[0]).toBe("history");
    expect(response.body.image_link).toBe("link to somewhere");
    expect(response.body.image_owner).toBe("image");
    expect(response.body.image_source).toBe("unsplash");
    expect(response.body.privacy).toBe(false);
  });

  test("testing if the post is deleted.", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .delete("/posts/666a851f024b1c34ece39586")
      .send({
        id: "666a851f024b1c34ece39586",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.status).toBe(200);
  });

  test("testing if a comment has been deleted.", async () => {
    app.use("/user", userRouter);

    let response = await request(app).post("/user/login").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    app.use("/", postsRouter);

    response = await request(app)
      .delete("/posts/666a851f024b1c34ece39582")
      .send({
        id: "666a851f024b1c34ece39582",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe("Post has been deleted.");
  });
});
