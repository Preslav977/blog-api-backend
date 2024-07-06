require("dotenv").config();

const request = require("supertest");

const express = require("express");

const LocalStrategy = require("passport-local").Strategy;

const passport = require("passport");

const session = require("express-session");

const bcrypt = require("bcrypt");

const User = require("../models/user");

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

app.use("/user", userRouter);

describe("testing the user routes and controllers", (done) => {
  beforeAll(() => initializeMongoServer());

  afterAll(() => done);

  test("testing if the user is successfully created", async () => {
    const creatingUser = {
      // id: "666ab1666f79c72c01496e8c",
      email: "testing123@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "user",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("Successfully created the user.");
  });

  test("testing if the user email is already taken", async () => {
    const creatingUser = {
      email: "testing123@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "user",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "User with that email already exists.",
    );
  });

  test("testing if the provided email it is valid", async () => {
    const creatingUser = {
      email: "testing-abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "user",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "Failed to meet the constrains for creating the user.",
    );
  });

  test("testing if the provided username it is at least 5 characters", async () => {
    const creatingUser = {
      email: "testing@abv.bg",
      username: "test",
      first_name: "p",
      last_name: "user",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "Failed to meet the constrains for creating the user.",
    );
  });

  test("testing if the provided first_name it is at least 1 character", async () => {
    const creatingUser = {
      email: "testing@abv.bg",
      username: "testing",
      first_name: "",
      last_name: "user",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "Failed to meet the constrains for creating the user.",
    );
  });

  test("testing if the provided last_name it is at least 3 characters", async () => {
    const creatingUser = {
      email: "testing@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "us",
      password: "12345678",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "Failed to meet the constrains for creating the user.",
    );
  });

  test("testing if the provided passwords are matching", async () => {
    const creatingUser = {
      email: "testing@abv.bg",
      username: "testing",
      first_name: "p",
      last_name: "usawd",
      password: "1234567",
      confirm_password: "12345678",
      verified_status: false,
      admin: false,
    };

    const response = await request(app).post("/user/signup").send(creatingUser);

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body.message).toEqual(
      "Failed to meet the constrains for creating the user.",
    );
  });

  test("testing if normal users can login", async () => {
    const response = await request(app).post("/user/login").send({
      email: "testing1@abv.bg",
      password: "12345678",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toMatch(response.body.token);
  });

  test("normal use shouldn't login as an author or an admin", async () => {
    const response = await request(app).post("/user/login_verified").send({
      email: "testing1@abv.bg",
      password: "12345678",
    });

    expect(response.body.message).toBe("Unauthorized");
  });

  test("verified users should login in and receive the token", async () => {
    const response = await request(app).post("/user/login_verified").send({
      email: "testing@abv.bg",
      password: "12345678",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toMatch(response.body.token);
  });

  test("test user should login in and receive the token", async () => {
    const response = await request(app).post("/user/login_test_user").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toMatch(response.body.token);
  });

  test("testing if user can fetch is information", async () => {
    let response = await request(app).post("/user/login_test_user").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .get("/user/")
      .send({ _id: "666ab1666f79c72c01496e8c" })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.email).toBe("testing2@abv.bg");

    expect(response.body.username).toBe("testing");

    expect(response.body.first_name).toBe("p");

    expect(response.body.last_name).toBe("testing");

    expect(response.body.password).toBe(response.body.password);

    expect(response.body.confirm_password).toBe(response.body.confirm_password);
  });

  test("testing if user can change his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing1@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8d")
      .send({
        email: "newemail@test.com",
        username: "newusername",
        first_name: "name",
        last_name: "testing",
        password: "1234567890",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.email).toBe("newemail@test.com");
    expect(response.body.username).toBe("newusername");
    expect(response.body.first_name).toBe("name");
    expect(response.body.last_name).toBe("testing");
    expect(response.body.password).toEqual(response.body.password);
    expect(response.body.confirm_password).toEqual(
      response.body.confirm_password,
    );
  });

  test("testing if provided valid email before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemailtest123.com",
        username: "newusername",
        first_name: "name",
        last_name: "testing",
        password: "1234567890",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });

  test("testing if provided 5 characters username before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemail@test.com",
        username: "awd",
        first_name: "name",
        last_name: "testing",
        password: "1234567890",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });

  test("testing if provided 1 character first name before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemail@test.com",
        username: "awdawd",
        first_name: "",
        last_name: "testing",
        password: "1234567890",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });

  test("testing if provided 3 character last name before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemail@test.com",
        username: "awdawd",
        first_name: "awd",
        last_name: "da",
        password: "1234567890",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });

  test("testing if provided 8 characters password before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemail@test.com",
        username: "awdawd",
        first_name: "awd",
        last_name: "daawd",
        password: "1234567",
        confirm_password: "1234567890",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });

  test("testing if provided passwords are matching before updating his information", async () => {
    let response = await request(app).post("/user/login").send({
      email: "testing2@abv.bg",
      password: "12345678",
    });

    const getToken = response.body.token;

    const token = ["Bearer", getToken];

    const RetrieveToken = JSON.stringify(token);

    response = await request(app)
      .put("/user/666ab1666f79c72c01496e8c")
      .send({
        email: "newemail@test.com",
        username: "awdawd",
        first_name: "awd",
        last_name: "daawd",
        password: "123456789",
        confirm_password: "12345678",
      })
      .set("Authorization", `${RetrieveToken}`);

    expect(response.body.message).toBe(
      "User did not meet the constrains and it was not updated.",
    );
  });
});
