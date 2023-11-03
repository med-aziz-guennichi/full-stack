import { Request } from "express"

export interface IRegistationBody {
    firstName:string
    lastName:string
    email:string
    password:string
    avatar?:string
}

export interface IRegistrationResponse{
    success:boolean;
    message:string;
    activationToken:string;
}

export interface IActivationToken {
    token: string;
    activationCode: string;
}

export interface IActivationRequest{
    activation_token: string;
    activation_code: string;
}
export interface ILoginRequest {
    email?: string;
    password?: string;
}
export interface CustomRequest extends Request {
    cookies: any
    user: any; // Change 'any' to the actual type of 'user'
    body: any
  }