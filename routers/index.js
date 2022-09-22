const agentRouter = require("./agent.router");
const userRouter = require("./user.router");

const Router = require("express").Router();

Router.use("/user",userRouter)
Router.use("/agent",agentRouter)

module.exports = Router;