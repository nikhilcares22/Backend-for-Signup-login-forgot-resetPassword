var nodemailer = require("nodemailer");
// var sgTransport = require("nodemailer-sendgrid-transport");
var smtpTransport = require("nodemailer-smtp-transport");
const config = require("../config/config");
const c = require('../constants/c');

var options = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: config.default.email,
    pass: config.default.pass,
  },
};

var transporter = nodemailer.createTransport(smtpTransport(options));



module.exports = async function (req, res, data) {
  try {
    let info = await transporter.sendMail(data);
    let message =
      "An email has been sent to the user having email " +
      info.accepted.forEach(email => {

      });;
    console.log(message);
    // console.log('info is ', info);
    res.status(200).json({
      success: c.SUCCESS,
      message: 'message',
    });

  } catch (error) {
    console.log(error);
    res.send()
  }

};
