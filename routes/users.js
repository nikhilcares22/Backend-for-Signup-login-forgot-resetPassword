var express = require("express");
var router = express.Router();
const validationMiddleware = require("../middleware/validation-middleware");
var userControllers = require("../controllers/userControllers");
const auth = require("../middleware/auth");

router.post("/signup", validationMiddleware.signUp, userControllers.signUp);

router.get("/verifyByEmail", userControllers.verifyByEmail);

router.get("/verifyByPhone", userControllers.verifyByPhone);

router.post("/login", validationMiddleware.login, userControllers.login);

router.get("/authorisedRoutes", auth, userControllers.authorisedRoutes);

router.get("/resetPassword/:token", userControllers.resetPasswordForm);

router.post("/resetPassword/:token", userControllers.resetPasswordRoute);

router.post("/forgotPassword", userControllers.forgotPassword);

router.post("/resendVerification", userControllers.resendVerification);

module.exports = router;
