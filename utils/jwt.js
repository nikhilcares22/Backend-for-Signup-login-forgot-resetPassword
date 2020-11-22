const jwt = require("jsonwebtoken");
const config = require("../config/config");
const user = require("../Models/user");
const { response } = require("express");

const encryptToken = function (user) {
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
};

module.exports = encryptToken;
