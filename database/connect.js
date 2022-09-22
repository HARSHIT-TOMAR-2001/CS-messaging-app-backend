require("dotenv").config();
const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URL;

const connectDB = () => {
  mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
      console.log("MongoDB Connected");
    });
};
module.exports = connectDB;
