var express = require("express");
var router = express.Router();
const User = require("../Models/user");
const c = require("../constants/c");
const validationMiddleware = require("../middleware/validation-middleware");
const { response } = require("express");
const jwt = require("jsonwebtoken");
var userControllers = require("../controllers/userControllers");
const auth = require("../middleware/auth");

router.post("/signup", validationMiddleware.signUp, userControllers.signUp);

router.post("/login", validationMiddleware.login, userControllers.login);

router.get("/authorisedRoutes", auth, userControllers.authorisedRoutes);

router.get("/resetPassword/:token", userControllers.resetPassword);

router.post("/forgotPassword", userControllers.forgotPassword);

module.exports = router;
