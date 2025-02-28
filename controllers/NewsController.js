import { v2 } from "cloudinary";
import prisma from "../DB/db.config.js";
import ErrorHandler from "../utils/Error.Handler.js";
import { body, validationResult } from "express-validator";
import RedisClient from "../DB/redis.config.js"
import GenerateKeysForRedis from "../utils/GenerateKeysForRedis.js";
import { sendEmali } from "../utils/mailer.js";
class NewsController {
  async Index(req, res, next) {
    var page = Number(req.query.page) || 1
    var limit = Number(req.query.limit) || 5
    if (page < 1) {
      page = 1
    }
    if (limit < 0 || limit > 100) {
      limit = 5
    }
    const skip = (page - 1) * limit
    const cacheKey=GenerateKeysForRedis(req)
    const news=await RedisClient.get(cacheKey)
    if(news){
      console.log('News form the Redis')
      return res.status(200).send(JSON.parse(news))
    }
    try {
      const lists = await prisma.news.findMany({ take: limit, skip: skip, include: { user: true }, orderBy: { id: "asc" } })
      const totalNews = await prisma.news.count()

      const responseData={ message: "All news from Actual DB", news: lists, metaData: { totalPages: Math.ceil(totalNews / limit), currentPage: page, currentLimit: limit } }
      await RedisClient.set(cacheKey,JSON.stringify({...responseData,message:"All news from Redis"}))
      console.log('News from Actual DB')
      return res.status(200).send(responseData)
    } catch (error) {
      next(error)
    }
  }
  async Show(req, res, next) {
    const { id } = req.params
    try {
      const key=GenerateKeysForRedis(req)
      const singleNewsFromRedis=await RedisClient.get(key)
      if(singleNewsFromRedis){
        return res.status(200).send(JSON.parse(singleNewsFromRedis))
      }

      const news = await prisma.news.findUnique({ where: { id: Number(id) }, include: { user: true } })
      if (!news) {
        return next(ErrorHandler(400, 'News Not Present with this ID'))
      }
      const responseData={message:"Single User from Redis",news}
      await RedisClient.set(key,JSON.stringify(responseData))

      return res.status(200).send({...responseData,message:"Single User from Actual DB"})
    } catch (error) {
      next(error)
    }
  }
  async Update(req, res, next) {
    const { id } = req.params
    const { title, content } = req.body
    const newsImage = req.file
    const data = {}
    try {
      var news = await prisma.news.findUnique({ where: { id: Number(id) } })
      if (!news) {
        return next(ErrorHandler(400, "News Not Found with this ID"))
      }
      if (req?.user?.id !== news?.user_id) {
        return next(ErrorHandler(401, "You don't take this action"))
      }
      let same = await prisma.news.findUnique({ where: { title } })
      if (same) {
        return next(ErrorHandler(400, "News Title is already present"))
      }
      if (title) {
        data.title = title
      }
      if (content) {
        data.content = content
      }
      if (news?.image) {
        const public_id = news.image.split("/").pop().split(".")[0]
        await v2.uploader.destroy(`backend_mastery/news/${public_id}`)
      }
      news = await prisma.news.update({ where: { id: Number(id) }, data: { ...data, image: newsImage ? newsImage.path : news.image } })
      const cacheList="api:news*"
      const key=await RedisClient.keys(cacheList)
      if(key.length>0){
        await RedisClient.del(key)
      }
      return res.status(201).send({ message: "News Updated Successfully", updatedNews: news })
    } catch (error) {
      next(error)
    }
  }
  async Create(req, res, next) {
    console.log(req.body)
    const result = validationResult(req.body)
    if (!result.isEmpty()) {
      return next(ErrorHandler(400, result.array()))
    }
    const newsImage = req.file
    const { user_id, title, content } = req.body
    try {
      var news = await prisma.news.findUnique({ where: { title } })
      if (news) {
        return next(ErrorHandler(400, "This News Title is already exists"))
      }
      if (Number(user_id) !== req.user.id) {
        return next(ErrorHandler(401, "You don't have access to create News"))
      }
      if (newsImage) {
        news = await prisma.news.create({ data: { user_id: Number(user_id), title, content, image: newsImage.path } })
      } else {
        news = await prisma.news.create({ data: { user_id: Number(user_id), title, content } })
      }
      const cacheList="api:news*"
      const key=await RedisClient.keys(cacheList)
      if(key.length>0){
        await RedisClient.del(key)
      }
      return res.status(201).send({ message: "News Creaeted Successfully", news })
    } catch (error) {
      next(error)
    }
  }
  async Delete(req, res, next) {
    const { id } = req.params
    try {
      const news = await prisma.news.findUnique({ where: { id: Number(id) } })
      if (!news) {
        return next(ErrorHandler(400, "News is not Present with this ID"))
      }
      const deletedNews=await prisma.news.delete({ where: { id: Number(id) } })
      const public_id=deletedNews.image.split("/").pop().split(".")[0]
      await v2.uploader.destroy(`backend_mastery/news/${public_id}`)
      const cacheList="api:news*"
      const key=await RedisClient.keys(cacheList)
      if(key.length>0){
        await RedisClient.del(key)
      }
      return res.status(200).send({ message: "News Deleted Successfully" })
    } catch (error) {
      next(error)
    }
  }
  
}

export default new NewsController();
