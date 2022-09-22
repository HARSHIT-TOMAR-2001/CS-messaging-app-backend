
const { register,signin, getAgentassignedThread, getAllMessages, makeMessageWithInaThreadFromAgent } = require("../controllers/agent.controller");
const verifyToken = require("../middlewares/auth");

const agentRouter=require("express").Router();

agentRouter.post("/register",register);
agentRouter.post('/signin',signin);
agentRouter.get('/thread/assigned',verifyToken,getAgentassignedThread);
agentRouter.get('/thread/messages',verifyToken,getAllMessages);
agentRouter.post('/create/message',verifyToken,makeMessageWithInaThreadFromAgent);
module.exports=agentRouter