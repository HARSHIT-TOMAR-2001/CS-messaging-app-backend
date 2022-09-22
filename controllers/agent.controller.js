require("dotenv").config();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");
const Agent = require("../models/agent.model");
const Thread = require("../models/thread.model");
const Message = require("../models/message.model");

const register=async(req,res)=>{
    const {name,email,password}=req.body;
    try {
        const result=await Agent.findOne({email});
        if(result){
           return res.status(400).send({msg:"Agent already exist with this email"});
        }
        else{
            const encryptedPassword=await bcrypt.hash(password,10);
            
            const token=jwt.sign({
               name:name,email:email 
            },process.env.TOKEN_KEY,{
                expiresIn:"2h"
            })
            
            const agent=new Agent({
                name,
                email,
                password:encryptedPassword,
                authToken:token,
            })
            const savedAgent= await agent.save();
            
            const findThread=await Thread.find({thread_active:true,agentId:null||""}).sort({created_at:1}).limit(1)
          console.log(findThread)
            if(findThread.length!=0){
                const updateThread=await Thread.findByIdAndUpdate(findThread[0].id,{
                    agentId:savedAgent.id
                })
                const updateAgent=await Agent.findByIdAndUpdate(savedAgent.id,{
                    thread_assigned:true
                })
                console.log(updateAgent);
                res.status(200).send({success:true,msg:"agent succesfully registered",agent:{agentId:updateAgent.id,thread_assigned:true,name:updateAgent.name,authToken:token}})
           
            }
            else
            { 
            res.status(200).send({success:true,msg:"agent succesfully registered",agent:{agentId:agent.id,name:agent.name,thread_assigned:false,authToken:token}})
            }
        }
          
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const signin=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const result=await Agent.findOne({email});
        if(!result){
           return res.status(400).send({msg:"No Agent exist with this email"});
        }
        else{
           const encryptedPassword=await bcrypt.compare(password,result.password);
           if(!encryptedPassword)return res.status(400).send({msg:"wrong password"})

            const token=jwt.sign({
               name:result.name,
               password:password 
            },process.env.TOKEN_KEY,{
                expiresIn:"2h"
            })
if(result.thread_assigned===false){
    const findThread=await Thread.find({thread_active:true,agentId:null||""}, { sort: { created_at: 1 }, limit: 1 })

    if(findThread.length!=0){
        const updateThread=await Thread.findByIdAndUpdate(findThread[0].id,{
            agentId:result.id
        })
        const updateAgent=await Agent.findByIdAndUpdate(result.id,{
            thread_assigned:true
        })
    }
}
            const updatedAgent=await Agent.findByIdAndUpdate(result.id,{
                authToken:token
            })

           res.status(200).send({success:true,agent:{agentId:updatedAgent.id,name:updatedAgent.name,authToken:token}})
        }
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const getAgentassignedThread=async(req,res)=>{
    const {agentId}=req.query;
    try {
        const thread=await Thread.findOne({agentId,thread_active:true})
        res.status(200).send({success:true,threadId:thread.id})
    } catch (error) {
        res.status(400).send({success:false,msg:error.message}) 
    }
}

const getAllMessages=async(req,res)=>{
    const {threadId}=req.query;
      try {
       const messages=await Message.find({threadId}).sort({created_at:1})
       res.status(200).send({success:true,messages:messages}) 
       
      } catch (error) {
       res.status(400).send({success:false,msg:error.message})
      }
   }

const makeMessageWithInaThreadFromAgent=async(req,res)=>{
    const {message,threadId}=req.body;
    try {
        const newMessage=new Message({
            threadId,
            message,
            isUserQuery:false,
            created_at:new Date()
    })
      await newMessage.save();
      res.status(200).send({success:true,message:newMessage}) 
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

module.exports={
    register,
    signin,
    getAgentassignedThread,
    getAllMessages,
    makeMessageWithInaThreadFromAgent
}