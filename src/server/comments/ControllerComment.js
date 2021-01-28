import express from "express";
import validator from "express-validation";
import { COMMENT_VALIDATION, REPLY_VALIDATION ,LIST_NEW_COMMENT ,GET_LIST_COMMENT_COMIC ,GET_LIST_COMMENT_CHAPTER} from "./ValidatorComment";
import { responseHelper } from "../../common/responsiveHelper";
import {createComment,getCommentsByComic,getCommentsByChapter,createReply,getListCommentNews} from "./ModelComment";
import {getInfoChapterById} from './../chapter/ModelChapter';
import {getComicById} from './../comic/ModelComic';
const NUMBER_LIMIT =10 ;
const router = express.Router();

//Tao comment
router.post("/create", validator(COMMENT_VALIDATION), async (req, res) => {
  try {
    let { userData, comment, comicId, chapterId } = req.body;
    let comicInfo , chapterInfo ;
    if(chapterId) {
      chapterInfo = await getInfoChapterById(chapterId);
      if(chapterInfo){
        comicId = chapterInfo.comic_id ;
      }
    }
    else {
      if(comicId){
        comicInfo = await getComicById(comicId);
      }
    }
    if( !(comicInfo || chapterInfo)) {
      throw "COMIC_OR_CHAPTER_NOT_FOUND"
    }
    if (!req.user) {
      const newComment = await createComment(comment, comicId, chapterId, {
        ...userData,
        ip: req.ip,
      });
      
      return responseHelper(req, res, null, newComment);
    } else {
      const userId = req.user._id;
      const newComment = await createComment(comment, comicId, chapterId, {
        id: userId,
      });
      return responseHelper(req, res, null, newComment);
    }
  } catch (error) {
    console.log(error);
    return responseHelper(req, res, error);
  }
});

//GET COMMENTS BY COMIC_ID
router.post("/comic", 
  validator(GET_LIST_COMMENT_COMIC),
  async (req, res) => {
  try {
    const { comicId ,page ,numberitem } = req.body;
    const {comments,numberComic} = await getCommentsByComic(comicId,page,numberitem);
    return responseHelper(req, res, null, comments,numberComic);
  } catch (error) {
    return responseHelper(req, res, error);
  }
});

//GET COMMENTS BY CREATOR_ID
router.post("/chapter",
  validator(GET_LIST_COMMENT_CHAPTER),
 async (req, res) => {
  try {
    const { chapterId ,page,numberitem} = req.body;
    const {comments,numberComic} = await getCommentsByChapter(chapterId,page,numberitem);
    return responseHelper(req, res, null, comments,numberComic);
  } catch (error) {
    return responseHelper(req, res, error);
  }
});

//REPLY
router.post("/reply/create", validator(REPLY_VALIDATION), async (req, res) => {
  try {
    if (!req.user) {
      const { replyText, commentId, userData } = req.body;
      userData.ip = req.ip;
      await createReply(replyText, commentId, userData);
      return responseHelper(req, res, null);
    } else {
      const { replyText, commentId } = req.body;
      await createReply(replyText, commentId, {
        id: req.user._id,
      });
      return responseHelper(req, res, null);
    }
  } catch (error) {
    return responseHelper(req, res, error);
  }
});
// LIST NEW COMMENT 
router.post("/list-new",
    validator(LIST_NEW_COMMENT),
    async(req, res)=>{
        try {
            let {page,numberitem}=req.body;
            let numberItem = numberitem || NUMBER_LIMIT ;
            let listComment = await getListCommentNews(page,numberItem);
            return responseHelper(req, res, null,listComment);
        } catch (error) {
            console.log(error);
            return responseHelper(req, res, error);
        }
    })

export default router;
