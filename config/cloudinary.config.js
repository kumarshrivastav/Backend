import {v2 as cloudinary} from "cloudinary"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const userAssestStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "backend_mastery/user",
        format: async (req, file) => "png",
        public_id: (req, file) =>file.originalname.split(".")[0]
    }
})

export const userUpload = multer({ storage: userAssestStorage })

const newsAssestStorage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"backend_mastery/news",
        format:async(req,file)=>"png",
        public_id:(req,file)=>file.originalname.split(".")[0]
    }
})

export const newsUpload=multer({storage:newsAssestStorage})
