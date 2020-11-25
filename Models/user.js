var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const salt = 10;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    // unique: 1,
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    // required: true,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  verificationType: {
    type: String,
    enum: ['email', 'phone']

  },
  verificationToken: {
    type: String,
  },
  verificationExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSocialLogin: {
    type: Boolean,
    default: false
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  // console.log(user);
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.comparePassword = async function (password, done) {
  // console.log("this");
  let result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userSchema);
