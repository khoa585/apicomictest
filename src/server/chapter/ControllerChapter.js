import express from "express";
import { getChapterByID ,setViewsRedis } from "./ModelChapter";
import { responseHelper } from "../../common/responsiveHelper";

const router = express.Router();

router.get("/detail/:chapterId", async (req, res) => {
  try {
    const { chapter, listChapters } = await getChapterByID(
      req.params.chapterId
    );
    setViewsRedis(chapter.comic_id._id);
    return responseHelper(req, res, null, { chapter, listChapters });
  } catch (error) {
    console.log(error);
    return responseHelper(req, res, error);
  }
});

export default router;
