const express = require("express");

const router = express.Router();

router.post("/category", (req, res) => {
  res.send("POST HTTP request");
});

module.exports = router;
