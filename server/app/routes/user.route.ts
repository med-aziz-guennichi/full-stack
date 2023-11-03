import { Router } from "express";
import UserController from "../controllers/user.controller";

class UserRoutes {
    private route = Router();
    private userController = new UserController();
    constructor(){
        this.initializeRoutes();
    }
    private initializeRoutes(){
        this.route.post("/registration",this.userController.registrationUser);
        this.route.post("/activation",this.userController.activateUser);
        this.route.post("/login",this.userController.loginUser);
        this.route.post("/refresh",this.userController.updateAccessToken);
    }
    public getRouter(){
        return this.route;
    }
}
export default UserRoutes;