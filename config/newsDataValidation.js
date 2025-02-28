import { check } from "express-validator";

export const newsDataValidation = [
  check("title", "Title is Required").isString().isLength({ max: 200 }),
  check("content", "Content is Required").isString().isLength({ max: 20000 }),
  check("user_id","UserId is Required").isNumeric()
  // check("newsImage", "News Image is Required").custom((value) => {
  //   const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  //   const fileType = value.split(".").pop();
  //   if (!validImageTypes.includes(`image/${fileType}`)) {
  //     throw new Error(
  //       "Invalid image type. Only JPEG, PNG and GIF are allowed."
  //     );
  //   }
  //   return true;
  // }),
];
