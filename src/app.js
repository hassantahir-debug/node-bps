const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json(
    {
      message: "Welcome to the BPS API!",
    },
    200,
  );
});

app.get("/test", (req, res) => {
  res.json(
    {
      message: "The test route is working!",
    },
    200,
  );
});

module.exports = app;
