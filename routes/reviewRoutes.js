const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("./../controllers/reviewController");
const authController = require("./../controllers/authController");
const {
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
} = reviewController;

const { protect, restricTo } = authController;
router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restricTo("user"), setTourUserIds, createReview);
//delete and review route
router
  .route("/:id")
  .get(getReview)
  .patch(restricTo("user", "admin"), updateReview)
  .delete(restricTo("user", "admin"), deleteReview);

//get all reviews route

// router.route("/:id").get( getReview);

module.exports = router;
