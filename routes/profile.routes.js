import {Router} from "express"
const router=Router()
import multer from "multer"
import authMiddleware from "../middleware/middleware.js"
import ProfileController from "../controllers/ProfileController.js"
const storage=multer.memoryStorage()
const upload=multer({storage,limits:{fileSize:1024*1024*3}})
router.put("/update/:id",authMiddleware,upload.single("profile"),ProfileController.update)

export default router  