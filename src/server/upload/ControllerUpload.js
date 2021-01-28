import express from "express";
import { responseHelper } from "../../common/responsiveHelper";
const fileUpload = require("../../common/fileUpload");
import fs from "fs";

const router = express.Router();

router.post("/image", fileUpload.single("image"), async (req, res) => {
  try {
    return responseHelper(req, res, null, req.file.path);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return responseHelper(req, res, error);
  }
});
export default router;
