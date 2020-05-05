const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndDelete(req.params.id);
    //if no tour with that id return err
    if (!doc) {
      return next(new AppError("No Document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Modal, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Modal.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query;
    if (!doc) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Modal) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //execute query
    const features = new APIFeatures(Modal.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //.explain() to indexes performances using mongoDB
    const doc = await features.query;
    //send response
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
