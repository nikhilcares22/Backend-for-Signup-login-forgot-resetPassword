var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
const config = require("../config/config");

var options = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: config.default.EMAIL,
    pass: config.default.PASS,
  },
};

var transporter = nodemailer.createTransport(smtpTransport(options));

module.exports = function (data) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  })
};
