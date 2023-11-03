import ejs from "ejs";
import jwt, { Secret } from "jsonwebtoken";
import { Model } from "mongoose";
import path from "path";
import { EmailOptions } from "../interfaces/Mail";
import { IActivationToken, IRegistationBody, IRegistrationResponse } from "../interfaces/User";
import { IUser, UserModel } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import EmailService from "../utils/sendMail";

class UserService {
    private userModel: Model<IUser>;
    private emailService = new EmailService();

    constructor(){
        this.userModel = UserModel.userModel;
    }

    public async registrationUser(firstName:string,lastName:string,email:string,password:string,avatar?:string):Promise<IRegistrationResponse>{
        try {
            const isEmailExist = await this.checkEmailExist(email);
            if(isEmailExist){
                throw new ErrorHandler("Email already exist", 400);
            }
            const user:IRegistationBody = {
                firstName,
                lastName,
                email,
                password,
                avatar
            };
            const activationToken = this.createActivationToken(user);
            const activationCode = (await activationToken).activationCode;
            const data = {
                user:{
                    firstName:user.firstName,
                    lastName:user.lastName
                },
                activationCode
            };
            await ejs.renderFile(
                path.join(__dirname,"../mails/activation-mail.ejs"),
                data
            );
            try {
                const emailOptions:EmailOptions = {
                    email:user.email,
                    subject:"Activate your account",
                    template:"activation-mail.ejs",
                    data
                };
               await this.emailService.sendMail(emailOptions);

               return {
                success:true,
                message:`Please check your email: ${user.email} to activate your account`,
                activationToken:(await activationToken).token
               }
            } catch (error:any) {
                throw new ErrorHandler(error.message,400)
              }
            } catch (error:any) {
              throw new ErrorHandler(error.message, 400);
           };
    }

    private async checkEmailExist(email: string): Promise<boolean> {
        try {
          const isEmailExist = await this.userModel.findOne({ email });
          return isEmailExist ? true : false;
        } catch (error:any) {
            throw new ErrorHandler(error.message, 400);
        }
      }

      private async createActivationToken(user: IRegistationBody): Promise<IActivationToken> {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const token = jwt.sign({
            user,activationCode
        },process.env.ACTIVATION_SECRET as Secret, {
            expiresIn:"5m"
        });
        return {token,activationCode};
      }
      


}

export default UserService;