import {Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser, logout, signup } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/signup").post(upload.fields([
    {
        name:"profilePic",
        maxcount:1
    }
]),signup)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logout)
export default router;