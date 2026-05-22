require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const authRouter = require("./src/routes/auth");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SOUL API Running",
  });
});

module.exports = app;