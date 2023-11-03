import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser, UserModel } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

interface CustomRequest extends Request {
    user?: IUser; 
}
// authenticated user
export const isAuthenticated = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;

    if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 401));
    }

    const user = await UserModel.userModel.findById(decoded.id);
    if (!user) {
        return next(new ErrorHandler("Please login to access this resource", 400));
    }
    req.user = user;
    next();
};