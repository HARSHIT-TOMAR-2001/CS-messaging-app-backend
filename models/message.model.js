let mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
     threadId:{
        type:String,
        ref:"Thread"
     },
     created_at:Date,
     message:String,
     isUserQuery:Boolean
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
