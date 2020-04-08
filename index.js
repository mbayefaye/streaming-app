const fs = require("fs");
const express = require("express");

//create express app
const app = express();

//listen
const PORT = 5000;
//read the file before sending to the client
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);
//routes
app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});
//starting server on port 5000
app.listen(PORT, () => {
  console.log(`server starting on port:${PORT}`);
});
