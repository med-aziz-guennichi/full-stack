import { NextFunction, Request, Response } from "express";
import postModel from "../models/post.model";
import { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

interface ICreatePost {
    content: string;
    fileUrl: string;
}
interface CustomRequest extends Request {
    user?: IUser; 
}
export const createPost = async(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const user = req.user;
        if(!user){
            return next(new ErrorHandler("User not found",404))
        }
        const {content,fileUrl} = req.body as ICreatePost;
        const newPost = await postModel.postModel.create({
            content,
            fileUrl,
            author:user._id
        });
        res.status(201).json({
            status:"success",
            data:{
                newPost,
                message:"New post created successfully"
            }
        })
        
    } catch (error) {
        console.log(error);
        next(error);
    }
}