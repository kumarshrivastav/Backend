import {Router} from "express"
import { loginValidation, registerValidation } from "../config/clientDataValidation.js"
import AuthController from "../controllers/AuthController.js"
import authMiddleware from "../middleware/middleware.js"
const router=Router()
import { userUpload } from "../config/cloudinary.config.js"
import imageValidation from "../middleware/imageValidation.js"
import { loginRateLimit,registerRateLimit, userListApiLimit } from "../config/apiRateLimiting.js"

router.post("/register",registerRateLimit,registerValidation,AuthController.register)
router.post("/login",loginRateLimit,loginValidation,AuthController.login)
router.put("/update/:id",authMiddleware,imageValidation,userUpload.single("profile"),AuthController.Update)
router.delete("/delete/:id",authMiddleware,AuthController.Delete)
router.get("/logout/:id",authMiddleware,AuthController.logout)
router.get("/lists",userListApiLimit,AuthController.Index)
router.get("/send-email",AuthController.SendEmail)


router.post("/test",userUpload.single("profile"),AuthController.TestImageUpload)
router.delete("/imagedelete/:publicId",AuthController.ImageDelete)

export default router;