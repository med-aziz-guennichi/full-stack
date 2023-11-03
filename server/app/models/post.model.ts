import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPost extends Document {
    content: string;
    fileUrl: string;
    author: {userId:string};
    comments: Array<{commentId:string}>;
    likes: Array<{userId:string}>;
}
class PostClass {
    public postModel!:Model<IPost>;

    constructor(){
        const postSchema:Schema<IPost> = new Schema({
            content:{
                type:String
            },
            fileUrl:{
                type:String
            },
            author:{
                type:Schema.Types.ObjectId,
                ref:"User"
            },
            comments:[
                {
                    type:Schema.Types.ObjectId,
                    ref:"Comment"
                }
            ],
            likes:[
                { 
                    type:Schema.Types.ObjectId,
                    ref:"User"
                }
            ]
        },
         {timestamps:true}
        );
        this.postModel = mongoose.model<IPost>("Post",postSchema);
    }
}

const postModel = new PostClass();
export default postModel;