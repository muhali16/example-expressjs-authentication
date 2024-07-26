const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name cannot be null"],
  },
  lastName: {
    type: String,
    required: [true, "Last name cannot be null"],
  },
  username: {
    type: String,
    required: [true, "Username cannot be null"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email cannot be null"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be null"],
  },
});

userSchema.statics.attempt = async function (username, password) {
  const user = await this.findOne({ username });
  const passwordCheck = bcrypt.compareSync(
    password,
    user?.password ?? "jksndcjknejkfniserfn",
  );
  return passwordCheck ? user : false;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
