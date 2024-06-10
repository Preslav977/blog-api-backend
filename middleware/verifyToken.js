const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization;

  // console.log(bearerHeader);

  const bearerHeaderParse = JSON.parse(bearerHeader);

  // console.log(bearerHeaderParse);

  const bearerHeaderJoin = bearerHeaderParse.join(" ");

  // console.log(bearerHeaderJoin);

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeaderJoin.split(" ");

    // const bearer = bearerHeader.split(" ");

    // console.log(bearer);

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
