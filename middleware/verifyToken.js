const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const retrieveFromLocalStorage = JSON.parse(localStorage.getItem("token"));

  const retrieveToken = retrieveFromLocalStorage.join(" ");

  const bearerHeader = retrieveToken;

  console.log(bearerHeader);

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");

    const bearerToken = bearer[1];

    req.token = bearerToken;

    jwt.verify(req.token, process.env.SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.authData = authData;

        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

module.exports = verifyToken;
