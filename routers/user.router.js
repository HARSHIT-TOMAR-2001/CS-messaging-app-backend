
const { register, signin, createThread, makeMessageWithInaThreadByUser, getAllMessages, makeThreadInactive, getAllActiveThreads } = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth");

const userRouter=require("express").Router();

userRouter.post("/register",register);
userRouter.post('/signin',signin);
userRouter.post('/create/thread',verifyToken,createThread);
userRouter.get('/active/threads',verifyToken,getAllActiveThreads);
userRouter.post('/create/message',verifyToken,makeMessageWithInaThreadByUser);
userRouter.get('/thread/messages',verifyToken,getAllMessages);
userRouter.post('/thread/closed',verifyToken,makeThreadInactive);
module.exports=userRouter