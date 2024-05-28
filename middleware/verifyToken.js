const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization;

  const bearerHeaderParse = JSON.parse(bearerHeader);

  const bearerHeaderJoin = bearerHeaderParse.join(" ");

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeaderJoin.split(" ");

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
