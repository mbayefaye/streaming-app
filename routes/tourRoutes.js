const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const reviewRouter = require("./../routes/reviewRoutes");
const {
  getAllTours,
  createTour,
  updateTour,
  getTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
  resizeTourImages,
  uploadTourImages,
} = tourController;
const { protect, restricTo, isLoggedIn } = authController;

router.route("/distance/:latlng/unit/:unit").get(getDistance);
router.route("/:tourId/reviews", reviewRouter);
router.route("/tour-stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(protect, restricTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router
  .route("/")
  .get(getAllTours)
  .post(protect, restricTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restricTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restricTo("admin", "lead-guide"), deleteTour);

//POST :tour/id/reviews
//router.route("/:tourId/reviews").post(protect, restricTo("user"), createReview);
//GET :tour/id/reviews
//POST :tour/id/reviews
module.exports = router;
