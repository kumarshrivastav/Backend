import express from "express";
import NewsController from "../controllers/NewsController.js";
import authMiddleware from "../middleware/middleware.js";
import { newsDataValidation } from "../config/newsDataValidation.js";
import { newsUpload } from "../config/cloudinary.config.js";
import imageValidation from "../middleware/imageValidation.js";
import { newsApiLimit, newsListApiLimit} from "../config/apiRateLimiting.js";
const router=express()
router.get("/lists",newsListApiLimit,NewsController.Index)
router.get("/list/:id",newsApiLimit,NewsController.Show)
router.put("/update/:id",authMiddleware,imageValidation,newsUpload.single("newsImage"),NewsController.Update)
router.post("/create",newsDataValidation,imageValidation,newsUpload.single("newsImage"),authMiddleware,NewsController.Create)
router.delete("/delete/:id",authMiddleware,NewsController.Delete)


export default router