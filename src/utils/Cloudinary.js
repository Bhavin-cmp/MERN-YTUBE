import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuring cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      //Here we are checking that file is uploaded or not in local storeage.
      throw new Error("Local File path is required");
    }
    // Upload image to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("Cloudinary Response", response);
    // Return the image URL
    console.log("Image uploaded successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      // Check if the file exists in local storage
      fs.unlinkSync(localFilePath); // Delete the file from local storage if error occurs while uploading.
    }
    if (error.name === "MulterError") {
      // Multer error handling
      console.log(
        "Multer error occurred while uploading image:",
        error.message
      );
    } else if (error.name === "CloudinaryError") {
      // Cloudinary error handling
      console.log(
        "Cloudinary error occurred while uploading image:",
        error.message
      );
    } else {
      console.log(
        "An unexpected error occurred while uploading image:",
        error.message
      );
    }
  }
};

export { uploadOnCloudinary };
