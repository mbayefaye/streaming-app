// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
const Review = require("./../modal/reviewModal");
const factory = require("./handlerFactory");

//middleware
exports.setTourUserIds = (req, res, next) => {
  //nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//create a review
exports.createReview = factory.createOne(Review);
//get all review
exports.getAllReviews = factory.getAll(Review);
//delete review
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
//get single review
exports.getReview = factory.getOne(Review);
