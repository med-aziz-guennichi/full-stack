import { Router } from "express";
import { createPost } from "../controllers/post.controller";
import { isAuthenticated } from "../middleware/auth";


class PostRoutes {
    private route = Router();
    constructor(){
        this.initializeRoutes();
    }
    private initializeRoutes(){
        this.route.post("/create",isAuthenticated,createPost);
    }
    public getRouter(){
        return this.route;
    }
}
export default PostRoutes;