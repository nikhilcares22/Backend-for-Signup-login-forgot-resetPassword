const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = {
  encryptToken: function (user) {
    return new Promise((done, reject) => {
      let payload = {
        id: user.id,
      };
      jwt.sign(
        payload,
        config.default.SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) reject(err);
          //   console.log(token);
          done(token);
        }
      );
    });
  },
  generateVerifyToken: function () {
    return new Promise((done, reject) => {
      require('crypto').randomBytes(20, (err, buf) => {
        let token = buf.toString("hex");
        done(token);
      });
    });
  },
  generateOTP: function () {
    return new Promise((done, reject) => {
      require('crypto').randomBytes(4, (err, buf) => {
        let token = buf.toString("hex");
        done(token);
      });
    });
  }
};
