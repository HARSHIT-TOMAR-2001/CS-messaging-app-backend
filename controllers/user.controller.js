require("dotenv").config();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");
const User = require("../models/user.model");
const Thread = require("../models/thread.model");
const Agent = require("../models/agent.model");
const Message = require("../models/message.model");


const register=async(req,res)=>{
    const {name,email,password}=req.body;
    try {
        const result=await User.findOne({email});
        
        if(result){
           return res.status(400).send({msg:"User already exist with this email"});
        }
        else{
            const encryptedPassword=await bcrypt.hash(password,10);
          
            const token=jwt.sign({
               name:name,email:email
            },process.env.TOKEN_KEY,{
                expiresIn:"2h"
            })
            const user=new User({
                name,
                email,
                password:encryptedPassword,
                authToken:token,
            })
         let beware= await user.save()

         res.status(200).send({success:true,msg:"User succesfully registered",token:token,name:name,email:email,userId:user.id})
        }
          
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const signin=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const result=await User.findOne({email});
        if(result===null){
           return res.status(400).send({msg:"No User exist with this email"});
        }
        else{
           const encryptedPassword=bcrypt.compare(password, result.password);
           if(!encryptedPassword)return res.status(400).send({msg:"wrong password"})

            const token=jwt.sign({
               name:result.name,
               email:result.email
            },process.env.TOKEN_KEY,{
                expiresIn:"2h"
            })

            const updatedUser=await User.findByIdAndUpdate(result.id,{
                authToken:token
            })

           res.status(200).send({success:true,userId:updatedUser.id,username:updatedUser.name,token:updatedUser.authToken})
        }
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}



const  createThread=async(req,res)=>{
    const {userId,message}=req.body;
    try {
        const agent=await Agent.findOne({thread_assigned:false})
        if(agent){
            //agent is available
        const thread=new Thread({
            userId,
            created_at:new Date(),
            agentId:agent._id
        })
        const newthread=await  thread.save();
        const updateAgent=await Agent.findByIdAndUpdate(agent.id,{
            thread_assigned:true
        })  

        const newMessage=new Message({
                threadId:newthread.id,
                message,
                isUserQuery:true,
                created_at:new Date()
        })
          await newMessage.save();

     res.status(200).send({success:true,message:"thread successfully created",threadId:newthread.id})    
    }
        else{
            // agent is not available

            const thread=new Thread({
                userId,
                created_at:new Date(),
            })
           const newthread= await  thread.save();
            const newMessage=new Message({
                threadId:newthread.id,
                message,
                isUserQuery:true,
                created_at:new Date()
        })
          await newMessage.save();
        res.status(200).send({success:true,message:"thread successfully created",threadId:newthread.id}) 
    }  
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const getAllMessages=async(req,res)=>{
 const {threadId}=req.query;
   try {
    const messages=await Message.find({threadId:threadId}).sort({created_at:1})
    res.status(200).send({success:true,messages:messages}) 
    
   } catch (error) {
    res.status(400).send({success:false,msg:error.message})
   }
}

const makeMessageWithInaThreadByUser=async(req,res)=>{
    const {message,threadId}=req.body;
    try {
        const thread=await Thread.findById(threadId);
        if(thread.thread_active===false){
            return res.status(400).send({success:false,msg:"message can't be sent,since thread is already closed!"})
        }
        const newMessage=new Message({
            threadId,
            message,
            isUserQuery:true,
            created_at:new Date()
    })
      await newMessage.save();
      res.status(200).send({success:true,message:newMessage}) 
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}
const getAllActiveThreads=async(req,res)=>{
    const {userId}=req.query;
    try {
        const threads=await Thread.find({userId:userId,thread_active:true});
        res.status(200).send({success:true,active_threads:threads}) 
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}
const makeThreadInactive=async(req,res)=>{
    const {threadId}=req.body;
    try {
        const thread=await Thread.findById(threadId);
        if(!thread){
            res.status(400).send({success:false,msg:"No thread exist with this id"})
        }
        else if(thread.agentId==null||thread.agentId==""){
            res.status(400).send({success:false,msg:"Thread is not yet assigned to a agent"})
        }
      else {
            // look for another thread for the agent
            const findThread=await Thread.find({$and:[{thread_active:true},{$or:[{agentId:null},{agentId:null}]}]}).sort({created_at:1}).limit(1)

            if(findThread.length!=0){
                     // updateAgent with new thread if active & unassigned thread exists
                const updateThread=await Thread.findByIdAndUpdate(findThread[0].id,{
                    agentId:thread.agentId
                })
            }
            else{
                const updateAgent=await Agent.findByIdAndUpdate(thread.agentId,{
                    thread_assigned:false
                })
            }
            //update the thread to inactive
            const updatethread=await Thread.findByIdAndUpdate(threadId,{thread_active:false});
            res.status(200).send({success:true,message:"user issue resolved,thread is inactive now"});
        }
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

module.exports={
    register,
    signin,
    makeMessageWithInaThreadByUser,
    createThread,
    getAllActiveThreads,
    getAllMessages,
    makeThreadInactive
}