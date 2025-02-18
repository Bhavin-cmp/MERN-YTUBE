import multer from "multer";

const storage = multer.diskStorage({
  // configure the how files should be stored on disk
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); //The callback function cb is called with null(indication no error) and the destination directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Generating a unique name for the file
    cb(null, file.fieldname + "-" + uniqueSuffix); // Appending the unique name to the file name
    // here file is the file object that is being uploaded and fieldname is the name of the file input field
  },
});

export const upload = multer({
  storage,
});
