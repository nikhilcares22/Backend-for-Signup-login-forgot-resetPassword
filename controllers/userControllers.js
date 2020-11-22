const User = require("../Models/user");
const c = require("../constants/c");
const encryptToken = require("../utils/jwt");
var async = require("async");
var crypto = require("crypto");
const config = require("../config/config");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var sgTransport = require("nodemailer-sendgrid-transport");
var mailer = require("../utils/mailer");

module.exports = {
  signUp: async function (req, res, next) {
    try {
      let { username, email, password } = req.body;

      let foundUser = await User.findOne({ email: email });
      if (!foundUser) {
        let savedUser = await new User({
          username: username,
          email: email,
          password: password,
        }).save();

        let token = await encryptToken(savedUser);

        res.status(200).json({
          success: c.SUCCESS,
          data: {
            user: {
              name: savedUser.username,
              email: savedUser.email,
            },
            token: token,
          },
        });
      } else {
        res.status(200).json({
          success: c.FALSE,
          message: c.ALREADYEXISTS,
        });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: c.FALSE,
        message: error,
      });
    }
  },

  login: async function (req, res) {
    try {
      let { email, password } = req.body;
      console.log("email and password are ", email, password);
      let foundUser = await User.findOne({ email: email });
      // console.log(foundUser);
      if (foundUser == null)
        return res.status(404).json({
          success: c.FALSE,
          message: c.MISSING,
        });

      let result = await foundUser.comparePassword(password);

      // console.log(result);
      if (result) {
        let token = await encryptToken(foundUser);
        // console.log(token);

        res.status(200).json({
          success: c.TRUE,
          message: `Welcome ${foundUser.username}`,
          token: token,
        });
      } else {
        res.status(401).json({
          success: c.FALSE,
          message: c.INVALIDCRED,
        });
      }
    } catch (error) {
      res.send(error);
    }
  },
  authorisedRoutes: function (req, res) {
    // console.log(req.user);
    res.status(200).json({
      success: c.TRUE,
      message: `Only authorised for ${req.user.username} having email ${req.user.email}`,
      data: "Authorised routes",
    });
  },

  forgotPassword: function (req, res) {
    const { email } = req.body;
    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          // console.log(token);
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: email }).then((user) => {
          // console.log(user);
          if (!user)
            return res.status(404).json({
              success: c.FALSE,
              message: c.MISSING,
            });
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000;

          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var mailOptions = {
          to: user.email,
          from: "nikhil",
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please copy the token :\n\n" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };

        mailer(req, res, mailOptions);
        // var options = {
        //   service: 'gmail',
        //   host: 'smtp.gmail.com',
        //   auth: {
        //     user: config.default.email,
        //     pass: config.default.pass,
        //   },
        // };

        // var transporter = nodemailer.createTransport(smtpTransport(options));




        // transporter.sendMail(mailOptions, (err, info) => {
        //   console.log("here");
        //   if (!err) {
        //     let message =
        //       "An email has been sent to the user having email " + user.email;
        //     console.log(message);
        //     // console.log(info);
        //     res.status(200).json({
        //       success: c.SUCCESS,
        //       message: message,
        //     });
        //   } else {
        //     console.log(err);
        //     return res.status(500).json({
        //       success: c.FALSE,
        //       message: c.EMAILFAILED,
        //     });
        //   }
        //   done(err, "done");
        // });
      },
    ]);
  },

  resetPassword: async function (req, res) {
    let token = req.params.token;
    console.log(token);
    let foundUser = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    // console.log(foundUser);
    if (!foundUser) {
      return res.status(404).json({
        success: c.FALSE,
        message: c.TOKENEXP,
      });
    }

    let { password, confirmPassword } = req.body;
    if (!password == confirmPassword) {
      return res.status(401).json({
        success: c.FALSE,
        message: c.PASSWORDMISMATCH,
      });
    }

    foundUser.password = password;
    foundUser.resetPasswordToken = undefined;
    foundUser.resetPasswordExpires = undefined;

    let updatedUser = await foundUser.save();

    // console.log(updatedUser);
    res.status(202).json({
      success: c.SUCCESS,

      message: `${c.PASSWORDCHANGED} for ${updatedUser.email}`,
      email: `email has been sent confirming your password has been changed`,
    });
  },
};
