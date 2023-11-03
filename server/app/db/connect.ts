import mongoose from "mongoose";

class Database {
    private uri:string;
    constructor(){
        this.uri = process.env.MONGO_URI!;
    }
    public async connect():Promise<void>{
        try {
            await mongoose.connect(this.uri);
            console.log("Database connected");
        } catch (error) {
            console.error("Database connection error : ",error);
        }
    }
}

export default Database;