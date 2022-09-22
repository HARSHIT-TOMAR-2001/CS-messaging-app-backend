let mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
     name:String,
     email:String,
     password:String,
     authToken:String
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
