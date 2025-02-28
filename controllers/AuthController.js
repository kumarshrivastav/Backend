import { validationResult } from "express-validator";
import ErrorHandler from "../utils/Error.Handler.js";
import bcryptjs from "bcryptjs";
import prisma from "../DB/db.config.js";
import TokenService from "../Tokens/TokenService.js";
import { v2 } from "cloudinary";
import RedisClient from "../DB/redis.config.js"
import GenerateKeysForRedis from "../utils/GenerateKeysForRedis.js";
import { sendEmali } from "../utils/mailer.js";
import { emailQueue, emailQueueName } from "../jobs/EmailQueueJob.js";
class AuthController {
  async register(req, res, next) {
    const body = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(ErrorHandler(401, result.array()));
    }
    try {
      const findUser = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (findUser) {
        return next(ErrorHandler(401, "Email is Already in Use"));
      }
      const salt = await bcryptjs.genSalt(10)
      body.password = await bcryptjs.hash(body.password, salt);
      const user = await prisma.user.create({ data: body });
      const listCacheKey="api:auth*"
      const key=await RedisClient.keys(listCacheKey)
      if(key?.length>0){
        await RedisClient.del(key)
      }
      return res
        .status(201)
        .send({ user, message: "User Registered Successfully" });
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    const body = req.body
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return next(ErrorHandler(401, result.array()))
    }

    try {
      const findUser = await prisma.user.findUnique({ where: { email: body.email } })
      if (!findUser) {
        return next(ErrorHandler(400, 'User Not Exists'))
      }
      const isCorrectPwd = await bcryptjs.compare(body.password, findUser.password)
      if (!isCorrectPwd) {
        return next(ErrorHandler(401, 'Unauthorized Access Denied..'))
      }
      const payload = { id: findUser.id, name: findUser.name, email: findUser.email }
      const { accessToken, refreshToken } = TokenService.generateToken({ payload })
      res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 })
      res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })
      return res.status(200).send({ message: "User LoggedIn Successfully", findUser })
    } catch (error) {
      next(error)
    }
  }
  async logout(req, res, next) {
    try {
      res.clearCookie("accessToken")
      res.clearCookie("refreshToken")
      return res.status(200).send({ message: "User Logout Successfully" })
    } catch (error) {
      next(error)
    }
  }
  async Delete(req, res, next) {
    const { id } = req.params
    try {
      console.log(req.user)
      if (Number(id) !== req.user.id) {
        return next(ErrorHandler(401, 'You cant take this action'))
      }
      const isExist = await prisma.user.findUnique({ where: { id: Number(id) } })
      if (!isExist) {
        return next(ErrorHandler(400, "User Not Exist with this ID"))
      }
      const user = await prisma.user.delete({ where: { id: Number(id) } })
      if (user.profile) {
        const public_id = user.profile.split("/").pop().split(".")[0]
        await v2.uploader.destroy(`backend_mastery/user/${public_id}`)
      }
      const listCacheKey="api:auth*"
      const key=await RedisClient.keys(listCacheKey)
      if(key?.length>0){
        await RedisClient.del(key)
      }
      res.status(200).send({ message: "User Deleted Successfully", user })
    } catch (error) {
      next(error)
    }
  }
  async Update(req, res, next) {
    const { id } = req.params
    const { name, email, password } = req.body
    const profile = req.file
    const data = {}
    try {
      var user = await prisma.user.findUnique({ where: { id: Number(id) } })
      if (!user) {
        return next(ErrorHandler(401, "User Not Found"))
      }
      if (user.id !== req.user.id) {
        return next(ErrorHandler(400, "You can't take this action"))
      }
      if (name) data.name = name

      if (email) data.email = email

      if (password) {
        let salt = await bcryptjs.genSalt(10)
        data.password = await bcryptjs.hash(password, salt)
      }

      const userProfile = user.profile
      if (userProfile && profile) {
        const public_id = userProfile.split("/").pop().split(".")[0]
        console.log(public_id)
        await v2.uploader.destroy(`backend_mastery/user/${public_id}`)
      }
      // after updatation of user we have to clear the redis for that particular api
      const listCacheKey="api:auth*"
      const key = await RedisClient.keys(listCacheKey)
      console.log(key)
      if(key.length>0){
        await RedisClient.del(key)
      }
      const updatedUser = await prisma.user.update({ where: { id: Number(id) }, data: { ...data, profile: profile ? profile.path : userProfile } })
      return res.status(201).send({ msg: "User updated successfully", user: updatedUser })
    } catch (error) {
      next(error)
    }
  }
  async Index(req, res, next) {
    try {
      var page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 5
      if (page <= 0) {
        page = 1
      }
      if (limit < 5 || limit > 10) {
        limit = 5
      }
      const skip = (page - 1) * limit

      // 1. check the api as a key is exist in redis, if yes the return the value
      const cacheKey = GenerateKeysForRedis(req)
      const cachedUsers = await RedisClient.get(cacheKey)
      if (cachedUsers) {
        console.log("data from redis")
        return res.status(200).send(JSON.parse(cachedUsers))
      }
      // 2. if no, then fetch the data from actual db and store in the redis and send back to the client

      const users = await prisma.user.findMany({
        skip: skip,
        take: limit,
        include: { news: true },
        orderBy: { id: 'asc' }
      })
      const totalUsers = await prisma.user.count()
      const totalPages = Math.ceil(totalUsers / limit)

      const responseData = { message: "User List from Actual DB", Users: users, metaData: { totalPages, currentPage: page, limit } }
      await RedisClient.set(cacheKey, JSON.stringify({ ...responseData, message: "User List from Redis" }))
      console.log("data from actual db")
      return res.status(200).send(responseData)
    } catch (error) {
      next(error)
    }
  }

  async SendEmail(req,res,next){
    try {
      const {email}=req.query
      const payload=[
        {
        toMail:email,
        subject:"Hey i am just testing-1",
        body:"<h1>Hello, World. I am from mastery backend team=1.</h1>",
      },
      {
        toMail:email,
        subject:"Hey i am just testing-2",
        body:"<h1>Hello, World. I am from mastery backend team=2</h1>"
      },
      {
        toMail:email,
        subject:"Hey i am just testing-3",
        body:"<h1>Hello, World. I am from mastery backend team=3.</h1>",
      }
    ]
      await emailQueue.add(emailQueueName,payload)
      return res.status(200).send({message:"Email Send Successfully"})

    } catch (error) {
      next(error)
    }
  }

  async TestImageUpload(req, res, next) {
    console.log(req.file)
    const userImage = req.file
    const validUserImageExt = ["jpeg", "jpg", "png", "gif"]
    const userImgEx = userImage.originalname.split(".")[1]
    if (!validUserImageExt.includes(userImgEx)) {
      return next(ErrorHandler(400, "Please upload the image file"))
    }
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        message: "Image uploaded successfully",
        imageUrl: req.file.path,
        cloudinaryId: req.file.filename,
      });
    }
    catch (error) {
      next(error)
    }
  }
  async ImageDelete(req, res, next) {
    const { publicId } = req.params
    try {
      const ImageDeleted = await v2.uploader.destroy(`backend_mastery/user/${publicId}`)
      console.log(ImageDeleted)
      return res.status(200).send({ message: "Image Deleted Successfully" })
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController();
