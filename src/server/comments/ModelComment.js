const Comment = require("../../model/comment");
const User = require("../../model/user");
const NUMBER_LIMIT =10 ;
export const createComment = async (comment, comicId, chapterId, userData) => {
  let newComment;
  if (!userData.id) {
    newComment = new Comment({
      content: comment,
      creator: {
        client: {
          name: userData.name,
          email: userData.email,
          ip: userData.ip,
        },
      },
      comic: comicId,
      chapter: chapterId,
    });
  } else {
    newComment = new Comment({
      content: comment,
      creator: {
        user: userData.id,
      },
      comic: comicId,
      chapter: chapterId,
    });
  }
  await newComment.save();
  return newComment;
};

export const getCommentsByComic = async (comicId,page,numberItem) => {
  numberItem = numberItem || NUMBER_LIMIT ;
  const comments = await Comment.find({ comic: comicId })
    .populate({
      path: "creator.user",
      select: ["first_name", "last_name", "email", "avatar"],
    })
    .populate({
      path: "replies.creator.user",
      select: ["first_name", "last_name", "email", "avatar"],
    })
    .populate({ path: "chapter", select: "name" })
    .sort({createdAt:-1})
    .skip((page-1)*numberItem)
    .limit(numberItem);
  const numberComic = await Comment.countDocuments({ comic: comicId });
  return {
    comments,
    numberComic
  }
    ;
};

export const getCommentsByChapter = async (chapterId,page,numberitem) => {
  let numberItem = numberitem || NUMBER_LIMIT ;
  const comments = await Comment.find({ chapter: chapterId })
    .populate({
      path: "creator.user",
      select: ["first_name", "last_name", "email", "avatar"],
    })
    .populate({
      path: "replies.creator.user",
      select: ["first_name", "last_name", "email", "avatar"],
    })
    .populate({ path: "chapter", select: "name" })
    .sort({createdAt:-1})
    .skip((page-1)*numberItem)
    .limit(numberItem);
    const numberComic = await Comment.countDocuments({ chapter: chapterId });
  return {
    comments,
    numberComic
  };
};

export const createReply = async (replyText, commentId, userData) => {
  const comment = await Comment.findById(commentId);
  let newReply;
  if (!userData.id) {
    newReply = {
      content: replyText,
      creator: {
        client: {
          name: userData.name,
          email: userData.email,
          ip: userData.ip,
        },
      },
    };
  } else {
    newReply = {
      content: replyText,
      creator: {
        user: userData.id,
      },
    };
  }
  comment.replies.push(newReply);
  await comment.save();
};
export const getListCommentNews = (page,numberitem)=>{
    return Comment.find()
    .populate({
        path:"comic",
        select:["name", "last_name", "email", "avatar"]
    })
    .populate({
      path: "chapter", select: ["name","_id"] 
    })
    .populate({
      path: "creator.user",
      select: ["first_name", "last_name", "_id", "avatar"],
    })
    .select("-creator.client.ip -replies")
    .sort({createdAt:-1})
    .skip((page-1)*numberitem)
    .limit(numberitem);
}