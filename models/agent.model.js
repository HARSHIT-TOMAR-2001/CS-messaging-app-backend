let mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
     name:String,
     email:String,
     password:String,
     thread_assigned:{
          type:Boolean,
          default:false
     },
     authToken:String,
});

const Agent = mongoose.model("Agent", AgentSchema);

module.exports = Agent;
