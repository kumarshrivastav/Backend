import { v2 as cloudinary } from "cloudinary";
import prisma from "../DB/db.config.js";
import ErrorHandler from "../utils/Error.Handler.js";
class ProfileController {
  async index(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      console.log(req.file);
      const { id } = req.params;
      const findUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
      if (!findUser) {
        return next(ErrorHandler(401, "User not found in our DB"));
      }
      const imageFile = req.file;
      const base64 = Buffer.from(imageFile.buffer).toString("base64");
      const dataURI = "data:" + imageFile.mimetype + ";base64," + base64;
      const response = await cloudinary.uploader.upload(dataURI);
      const updatedUser = await prisma.user.update({
        data: { profile: response.url },
        where: { id: Number(id) },
      });
      return res
        .status(200)
        .send({ message: "Profile Updated Sucessfully", userUpdated: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProfileController();
