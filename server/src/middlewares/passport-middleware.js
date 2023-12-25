const passport = require("passport");
const { Strategy } = require("passport-jwt");
const { SECRET } = require("../constants");
const db = require("../db");

const cookieExtractor = function (req) {
  let token = null;

  // Check if the Authorization header is present
  if (req.headers.authorization) {
    // Extract the token from the Authorization header
    const authorizationHeader = req.headers.authorization;

    // Check if the header starts with "Bearer"
    if (authorizationHeader.startsWith("Bearer ")) {
      // Extract the token excluding the "Bearer " prefix
      token = authorizationHeader.slice(7);
    }
  }

  return token;
};

const opts = {
  secretOrKey: SECRET,
  jwtFromRequest: cookieExtractor,
};

passport.use(
  new Strategy(opts, async ({ id }, done) => {
    try {
      const { rows } = await db.query(
        "SELECT user_id, email FROM users WHERE user_id = $1",
        [id]
      );

      if (!rows.length) {
        throw new Error("401 not authorized");
      }

      let user = { id: rows[0].user_id, email: rows[0].email };

      return await done(null, user);
    } catch (error) {
      console.log(error.message);
      done(null, false);
    }
  })
);
