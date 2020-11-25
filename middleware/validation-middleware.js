const validator = require("../utils/validator");
const c = require("../constants/c");

module.exports = {
  signUp: (req, res, next) => {
    const validateRule = {
      username: "required|string",
      email: "required|email",
      phone: "required|string|size:10",
      password: "required|string|min:4",
    };

    validator(req.body, validateRule, {}, (err, status) => {
      if (!status) {
        res.status(412).json({
          success: c.FALSE,
          message: c.VALIDATIONERR,
          error: err.errors,
        });
      } else {
        next();
      }
    });
  },

  login: (req, res, next) => {
    const validateRule = {
      email: "required_without:phone|email",
      password: "required|string|min:4",
      phone: "required_without:email|string|size:10",
    };

    validator(req.body, validateRule, {}, (err, status) => {
      if (!status) {
        res.status(412).json({
          success: c.FALSE,
          message: c.VALIDATIONERR,
          error: err.errors,
        });
      } else {
        next();
      }
    });
  },
};
