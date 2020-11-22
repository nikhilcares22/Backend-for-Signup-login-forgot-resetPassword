const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../Models/user");
const c = require("../constants/c");

module.exports = async function (req, res, next) {
  if (!req.header("authorization"))
    return res.status(401).json({ message: "Unauthorised" });

  const token = req.header("authorization").split(" ")[1];
  // console.log(token);
  try {
    const decoded = jwt.verify(token, config.default.SECRET);
    // console.log(decoded);
    let foundUser = await User.findById(decoded.id);
    if (!foundUser)
      return res.status(404).json({
        success: c.FALSE,
        message: c.MISSING,
      });
    req.user = foundUser;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Unauthorised" });
  }
};
