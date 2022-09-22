const express = require('express'); 
const app = express();   
const cors = require("cors")           
var mongoose = require('mongoose');
const Router = require("./routers");
const bodyParser = require('body-parser');
const connectDB = require("./database/connect")();




app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 
app.use(cors())

app.use("/api",Router);
app.get("/","welcome to css messaging app!!");
const PORT =process.env.PORT || 5000;;
require('dotenv').config()
const server = app.listen(PORT, function () {
    console.log("Server is up and running at port:", PORT);
  });
