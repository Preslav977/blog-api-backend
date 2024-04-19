const express = require("express");

const router = express.Router();

router.get("/account", (req, res) => {
  res.send("GET HTTP account request");
});

router.post("/account/login", (req, res) => {
  res.send("POST HTTP account login request");
});

router.post("/account/signup", (req, res) => {
  res.send("POST HTTP account signup request ");
});

module.exports = router;
