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
});
