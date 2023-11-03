require("dotenv").config();
import { Response } from "express";
import jwt from 'jsonwebtoken';
import { IUser } from "../models/user.model";


interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    samSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}


 // parse environment variables to integrate with fallback values
 const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
 const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

 // options for cookies
 export const accessTokenOptions: ITokenOptions = {
     expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
     maxAge: accessTokenExpire * 60 * 60 * 1000,
     httpOnly: true,
     samSite: 'lax'
 };
 export const refreshTokenOptions: ITokenOptions = {
     expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
     maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
     httpOnly: true,
     samSite: 'lax'
 };

function SignAccessToken(user:IUser) : string{
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN || "", {
        expiresIn: "5m",
      });
}

function SignRefreshToken(user:IUser):string{
    return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN || "", {
        expiresIn: "3d",
      });
}
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = SignAccessToken(user);
    const refreshToken = SignRefreshToken(user);
    
    // only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    // res.cookie("access_token", accessToken, accessTokenOptions);
    // res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        token: accessToken,
        refreshToken: refreshToken
    });
};
