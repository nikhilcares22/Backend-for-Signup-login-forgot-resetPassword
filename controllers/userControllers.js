const User = require("../Models/user");
const c = require("../constants/c");
const tokens = require("../utils/jwt");
var async = require("async");
var crypto = require("crypto");
const config = require("../config/config");
var twilio = require("../services/twilio");
var mailer = require("../utils/mailer");
const user = require("../Models/user");

module.exports = {
  signUp: async function (req, res, next) {
    try {
      let { username, email, password, phone, verificationType } = req.body;
      verificationType = verificationType.toLowerCase();

      let foundUser = await User.findOne({
        $or: [{ email: email }, { phone: phone }],
      });
      // console.log(foundUser);


      if (!foundUser) {
        let savedUser = await new User({
          username: username,
          email: email,
          password: password,
          phone: phone,
        });

        let success;
        let verificationToken;

        async function verificationByEmail() {
          verificationToken = await tokens.generateVerifyToken();
          //send mail
          let mailOptions = {
            to: savedUser.email,
            from: "nikhil",
            subject: "Verification Email",
            text:
              "You are receiving this because you (or someone else) have requested to use this email to register to the abc app.\n\n" +
              "Please verify by licking on the link below\n\n" +
              "http://" +
              req.hostname +
              ":" +
              req.socket.localPort +
              "/users/verifyByEmail?token=" +
              verificationToken +
              "\n\n" +
              "If you did not request this, please ignore this email .\n",
          };

          success = await mailer(mailOptions);
          if (success.accepted != []) return verificationToken;
          else return '';
        }

        async function verificationByPhone() {
          verificationToken = await tokens.generateOTP();
          let data = {
            body: `The following is the Generated OTP \n\n\n${verificationToken}\n\nDo not share this to OTP with anyone.
            Enter this OTP into the following url to verify your account.
            \n\n`+
              `http://${req.hostname}:8080/users/verifyByPhone`,
            from: '+16504190743',
            to: '+91' + savedUser.phone
          };
          let success = await twilio(data);
          console.log('successsss', success);
          if (success.body != '') return verificationToken;
          else return '';

        }

        if (verificationType == 'email') {
          successToken = await verificationByEmail();
          console.log(successToken);
        }
        else if (verificationType == 'phone') {
          successToken = await verificationByPhone();
          console.log(successToken);
        }

        if (successToken != '') {
          // let savedUser = await new User({
          //   username: username,
          //   email: email,
          //   password: password,
          //   phone: phone,
          //   verificationType: verificationType,
          //   verificationToken: successToken,
          //   verificationExpires: Date.now() + 3600000,
          // }).save();
          savedUser.verificationType = verificationType;
          savedUser.verificationToken = verificationToken;
          savedUser.verificationExpires = Date.now() + 3600000;
          await savedUser.save();

          //jwt
          let token = await tokens.encryptToken(savedUser);

          res.status(200).json({
            success: c.SUCCESS,
            data: {
              user: {
                name: savedUser.username,
                email: savedUser.email,
              },
              message: c.EMAILSENT,
              token: token,
            },
          });
        } else {
          res.status(400).json({
            success: c.FALSE,
            message: c.EMAILSMSFAILED,
          });
        }
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
  verifyByEmail: async function (req, res) {
    try {
      let verificationToken = req.query.token;
      if (!verificationToken || verificationToken == '') return res.status.json({
        status: c.FALSE,
        message: c.TOKENINV
      });
      let foundUser = await User.findOne({
        verificationToken: verificationToken,
        verificationExpires: { $gt: Date.now() },
      });
      if (foundUser != null) {
        foundUser.verificationToken = undefined;
        foundUser.verificationExpires = undefined;
        foundUser.isVerified = true;
        await foundUser.save();
        res.status(201).json({
          success: c.TRUE,
          message: c.VERIFIEDSUCCESS
        });
      } else {
        return res.status(404).json({
          success: c.FALSE,
          message: c.TOKENEXP
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: c.FALSE,
        error: c.SERVERERR,
      });
    }
  },

  verifyByPhone: async function (req, res) {
    console.log(req.body);
    let { verificationToken } = req.body;
    if (verificationToken == null || verificationToken == '') return res.status(404).json({
      status: c.FALSE,
      message: c.TOKENINV
    });
    let foundUser = await User.findOne({
      verificationToken: verificationToken,
      verificationExpires: { $gt: Date.now() }
    });
    console.log(foundUser);
    if (foundUser == null) return res.status(404).json({
      success: c.FALSE,
      message: c.TOKENEXP
    });
    foundUser.isVerified = true;
    foundUser.verificationToken = undefined;
    foundUser.verificationExpires = undefined;
    foundUser.save();
    res.status(201).json({
      success: c.TRUE,
      message: c.VERIFIEDSUCCESS
    });
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
      async function (done) {
        let token = await tokens.generateVerifyToken();
        return token;
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
            "Please click on the link :\n\n" +
            "http://" +
            req.hostname +
            ":" +
            req.socket.localPort +
            "/users/resetPassword/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };

        mailer(mailOptions)
          .then((info) => {
            let emails = "";
            info.accepted.forEach((email) => {
              emails += `${email}, `;
            });
            let message =
              "An email has been sent to the user having email " + emails;
            res.status(200).json({
              success: c.TRUE,
              message: message,
            });
          })
          .catch((err) => {
            // console.log(err);
            return res.status(500).json({
              success: c.FALSE,
              message: c.EMAILFAILED,
            });
          });
      },
    ]);
  },

  resetPasswordForm: async function (req, res) {
    let token = req.params.token;
    // console.log(token);
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
    } else {
      req.user = foundUser;
      res.render("resetForm");
    }
  },

  resetPasswordRoute: async function (req, res) {
    let token = req.params.token;
    // console.log(token);
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
    let mailOptions = {
      to: foundUser.email,
      from: "nikhil",
      subject: "password changed successfully",
      text:
        "This mail is confirming that You have successfully changed your password",
    };

    mailer(mailOptions);

    // console.log(updatedUser);
    res.status(202).json({
      success: c.SUCCESS,
      message: `${c.PASSWORDCHANGED} for ${updatedUser.email}`,
      email: `email has been sent confirming your password has been changed`,
    });
  },
};
