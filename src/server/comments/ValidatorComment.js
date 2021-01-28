import Joi from "joi";

export const COMMENT_VALIDATION = {
  options: { allowUnknownBody: false },
  body: {
    comment: Joi.string().required(),
    chapterId: Joi.string(),
    comicId: Joi.string(),
    userData: Joi.object({
      name: Joi.string(),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    }),
  },
};

export const REPLY_VALIDATION = {
  options: { allowUnknownBody: false },
  body: {
    replyText: Joi.string().required(),
    commentId: Joi.string().required(),
    userData: Joi.object({
      name: Joi.string(),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    }),
  },
};
export const LIST_NEW_COMMENT = {
  options: { allowUnknownBody: false },
  body: {
      page:Joi.number().required(),
      numberitem:Joi.number()
  }
}
export const GET_LIST_COMMENT_COMIC = {
    options: { allowUnknownBody: false },
    body: {
        comicId:Joi.string().required(),
        page:Joi.number().required(),
        numberitem:Joi.number()
    }
}
export const GET_LIST_COMMENT_CHAPTER = {
  options: { allowUnknownBody: false },
  body: {
      chapterId:Joi.string().required(),
      page:Joi.number().required(),
      numberitem:Joi.number()
  }
}