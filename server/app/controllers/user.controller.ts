import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Model } from "mongoose";
import { IActivationRequest, ILoginRequest, IRegistationBody } from "../interfaces/User";
import { IUser, UserModel } from "../models/user.model";
import UserService from "../services/user.service";
import ErrorHandler from "../utils/ErrorHandler";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";

interface CustomRequest extends Request {
    cookies: any;
    user?: IUser; 
}
class UserController {
    private userService = new UserService();
    private userModel = Model<IUser>;

    constructor(){
        // Initialize the userService property here
        this.userService = new UserService();
        this.userModel = UserModel.userModel;
        // Bind the registrationUser method to the UserController instance
        this.registrationUser = this.registrationUser.bind(this);
        this.activateUser = this.activateUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.updateAccessToken = this.updateAccessToken.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
    }

    public async registrationUser(req:Request,res:Response,next:NextFunction){
        try {
            const {firstName,lastName,email,password,avatar} = req.body as IRegistationBody;
            const result = await this.userService.registrationUser(firstName,lastName,email,password,avatar);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    public async activateUser(req:Request,res:Response,next:NextFunction){
        try {
            const { activation_token, activation_code } = req.body as IActivationRequest;

            const newUser:{user:IUser;activationCode:string} = jwt.verify(
                activation_token,
            process.env.ACTIVATION_SECRET as string
            ) as { user: IUser; activationCode: string };
            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Invalid activation code", 400));
            };
            const { firstName,lastName, email, password ,avatar} = newUser.user;
            const existUser = await this.userModel.findOne({email});
            
        if (existUser) {
            return next(new ErrorHandler("User already exist", 400));
        }
        await this.userModel.create({
            firstName,
            lastName,
            email,
            password,
            avatar
        });
        res.status(201).json({
            success: true,
            message: "User activated successfully",
        })
        } catch (error:any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    private async comparePassword(password:string,user:IUser){
        return await bcrypt.compare(password,user.password);
    }
    public async loginUser(req:Request,res:Response,next:NextFunction){
        try {
            const {email,password} = req.body as ILoginRequest;
            if (!email || !password) {
                return next(new ErrorHandler("Please enter email and password", 400));
            }
            const user = (await this.userModel.findOne({ email }).select("+password")) as IUser;
            
            if (!user) {
                return next(new ErrorHandler("Invalid email or password", 400));
            }
            const isPasswordMatched = await this.comparePassword(password,user);
            if (!isPasswordMatched) {
                return next(new ErrorHandler("Invalid email or password", 400));
            }
            sendToken(user,200,res);
        } catch (error:any) {
          console.log(error);
          return next(new ErrorHandler(error.message, 400))
        }
    }
    public async logoutUser(req:Request,res:Response,next:NextFunction){
        try {
            res.cookie("access_token", "", {
                maxAge: 1
            });
            res.cookie("refresh_token", "", {
                maxAge: 1
            });
           
            res.status(200).json({
                success: true,
                message: "Logged out successfully"
            })
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }
    }
    
    public async updateAccessToken (req:CustomRequest,res:Response,next:NextFunction){
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = 'Could not refresh token';
        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }
        const user = await this.userModel.findById(decoded.id as string);
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m"
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d"
        });
        req.user = user;
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);
        res.status(200).json({
            status: "success",
            accessToken
        })
    }
}

export default UserController;