const config = require("../config/config");
let mongoose = require("mongoose");

mongoose.connect(
  config.default.DATABASE,
  {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log(`connected successfully`);
  }
);

module.exports = mongoose;
