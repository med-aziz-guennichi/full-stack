import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Document, Model, Schema } from "mongoose";


const emailRegexPattern:RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    avatar:string;
    isVerified:boolean;
    posts:Array<{postId : string}>;
    comparePassword : (password:string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

class UserClass {
    public userModel!:Model<IUser>;
    constructor(){
        const userSchema:Schema<IUser> = new Schema(
            {
                firstName:{
                    type:String,
                    required:[true,"Please enter your first name"]
                },
                lastName:{
                    type:String,
                    required:[true,"Please enter your last name"]
                },
                email:{
                    type:String,
                    required:[true,"Please enter your email"],
                    validate:{
                        validator:function(value:string){
                            return emailRegexPattern.test(value);
                        },
                        message:"Please enter a valid email"
                    },
                    unique:true
                },
                password:{
                    type:String,
                    required:[true,"Please enter your password"]
                },
                avatar:{
                    type:String
                },
                
                isVerified:{
                    type:Boolean,
                    default:false
                },
                posts:[
                    {
                        postId:String
                    }
                ]
                
            },
            {timestamps:true}
        );

        // hash password before saving
        userSchema.pre<IUser>("save",async function(next) {
            if(!this.isModified("password")){
                next();
            }
            this.password = await bcrypt.hash(this.password,10);
            next();
        });
        this.userModel = mongoose.model<IUser>("User",userSchema);
    }
    // Sign Access Token
    SignAccessToken(user:IUser) : string{
        return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN || "", {
            expiresIn: "5m",
          });
    }
    SignRefreshToken(user:IUser):string{
        return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN || "", {
            expiresIn: "3d",
          });
    }
    // compare password
     async comparePassword(enteredPassword: string, user: IUser): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, user.password);
      }
}

const UserModel = new UserClass();

export { UserClass, UserModel };
