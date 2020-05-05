const multer = require("multer");
const sharp = require("sharp");
const User = require("../modal/userModal");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

//------------multer middleware---------//

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image please upload only images", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  //if no file in the body
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
//-----------route handler------------

const filtereObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//get all users
exports.getAllUsers = factory.getAll(User);
//get user
exports.getUser = factory.getOne(User);
//delete user
exports.deleteMe = factory.deleteOne(User);
//update user data
exports.updateUser = factory.updateOne(User);
//update user
exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route is not for passsword update ,please use /updateMyPassword",
        400,
      ),
    );
  }
  //filtered fields we dont nedd
  const filteredBody = filtereObj(req.body, "name", "email");
  //upload image
  if (req.file) filteredBody.photo = req.file.filename;
  //update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
//create user
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route not yet defined , please use sign up instead",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route not yet defined",
  });
};
