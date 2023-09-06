import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import e from "express";

export const uploads = multer({ dest: "./temp" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadFiles = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "products",
      width: 400,
      height: 400,
      use_filename: true,
      unique_filename: false,
    });
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

// export const uploadFiles = async (files) => {
//   try {

//   } catch (error) {

//   }
//   const promises = files.map((file) =>
//     cloudinary.uploader.upload(file.path, {
//       folder: "products",
//       width: 400,
//       height: 400,
//       use_filename: true,
//       unique_filename: false,
//     })
//   );
//   const results = await Promise.all(promises);
//   return results;
// };
