let mongoose = require("mongoose");
const ThreadSchema = new mongoose.Schema({
     userId:{
        type:String,
        ref:'User'
     },
     agentId:{
       type:String,
       default:null,
       ref:'Agent'
     },
     created_at:Date,
     thread_active:{
       type:Boolean,
       default:true
     },
});

const Thread = mongoose.model("Thread", ThreadSchema);

module.exports = Thread;
