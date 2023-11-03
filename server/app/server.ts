import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from 'express';
import Database from "./db/connect";
import { ErrorMiddleware } from './middleware/error';
import PostRoutes from "./routes/post.route";
import UserRoutes from "./routes/user.route";


dotenv.config();
class MyServer {
  private app: Express;
  private database = new Database();
  private port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  private userRoutes = new UserRoutes();
  private postRoutes = new PostRoutes();

  constructor() {
    this.app = express();
    this.connectDataBase();
    this.configureMiddleware();
    this.configureRoutes();
    this.errorsMiddleware();
  }
  private connectDataBase(): void {
      this.database.connect().then(()=>{
        this.start(this.port);
      }).catch((error)=>{
        console.log("Database connection error : ",error);
      })
  }
  private configureMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors({
      origin:"http://localhost:5173",
      credentials:true
    }));
  }

  private configureRoutes(): void {
    this.app.use("/api/v1",this.userRoutes.getRouter());
    this.app.use("/api/v1",this.postRoutes.getRouter());
  }

  private errorsMiddleware():void{
    this.app.use(ErrorMiddleware)
  }

  private start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
const server = new MyServer();
server;