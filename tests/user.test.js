const request = require("supertest");

const express = require("express");

const userRouter = require("../routes/users");

const initializeMongoServer = require("../mongoConfigTesting");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter);

describe("testing the user routes and controllers", () => {
  test("testing if the user is successfully created", async () => {
    initializeMongoServer();

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
    const response = await request(app).post("/user/login").send({ _id: 0 });

    console.log(response);

    // expect(response.header["content-type"]).toMatch(/json/);

    // console.log(response.status);
  });
});
