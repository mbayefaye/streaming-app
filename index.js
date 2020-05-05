const express = require("express");
const path = require("path");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRouter");
const reviewRouter = require("./routes/reviewRoutes");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const globalErrorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({
  path: "./config.env",
});

//connect to databas
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

//local connection
//mongoose.connect(process.env.DATABASE_LOCAL);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connection succesful");
  });
//create express app
const app = express();

//pug template engines
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// Serving static files
// app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public/img/tours")));

//----------------Middlewares-------------

// set security http headers
app.use(helmet());
//developement logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//limit request  fvrom same ip
const limiter = rateLimit({
  //number of limit
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: `Too many request from this IP ,please try again in an hour`,
});
app.use("/api", limiter);
//bodyparser:reading data from the body into req.body
app.use(
  express.json({
    limit: "10kb",
  }),
);

// Serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
//Data sanitization againt NOSQL query injection
app.use(mongoSanitize());
//data sanitization againt xss
app.use(xss());
//prevent parameters pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

//stest middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
//------------routes------------
app.get("/", (req, res) => {
  res.status(200).render("base");
});
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/users", userRouter);
//route handler:not found routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
//middleware error handling
app.use(globalErrorHandler);
//listen
const PORT = 8000;
//starting server on port 5000
const server = app.listen(PORT, () => {
  console.log(`server starting on port:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
