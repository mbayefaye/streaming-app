const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = userController;

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restricTo,
} = authController;
//upload photo

router.post("/login", login);
router.post("/signup", signup);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
//protect all route after this middleware
router.use(protect);
router.get("/me", getMe, getUser);
router.patch("/updateMyPassword", updatePassword);
router.delete("/deleteMe", deleteMe);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);

router.use(restricTo("admin"));
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
