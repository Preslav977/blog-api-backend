const request = require("supertest");

const express = require("express");

const postsRouter = require("../routes/post");

const initializeMongoServer = require("../mongoConfigTesting");

const app = express();

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
});
