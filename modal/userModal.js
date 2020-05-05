const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide Password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm the same password"],
    validate: {
      //this only works on SAVE!!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Password doesn't match",
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//hash password before save the user
userSchema.pre("save", async function (next) {
  //only run rhis function if password was actually modified
  if (!this.isModified("password")) return next();
  //else hash the password
  this.password = await bcrypt.hashSync(this.password, 12);
  //not send to the database
  this.passwordConfirm = undefined;
  //run
  next();
});

//
userSchema.pre(/^find/, function (next) {
  //this poinst to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", function (next) {
  //if we dont modify the password go next
  if (!this.isModified("password") || this.isNew) return next();
  //set the passwordChangeAt to the date now
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimeStamp;
  }
  //not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
