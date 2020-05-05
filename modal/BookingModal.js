const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a Tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

BookingSchema.pre("/^find/", function (next) {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });
});

module.exports = mongoose.model("Booking", BookingSchema);
