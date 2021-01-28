import Joi from "joi";
export const VALIDATION_GET_LIST_COMIC = {
  options: { allowUnknownBody: false },
  body: {
    page: Joi.number().required(),
    type: Joi.number().required(),
    numberitem: Joi.number(),
  },
};
// export const VALIDATION_SEARCH_COMIC = {
//   options: { allowUnknownBody: false },
//   body: {
//     query: Joi.string().required(),
//     page: Joi.number().required(),
//     numberitem: Joi.number(),
//   },
// };
export const VALIDATION_SEARCH_COMIC = {
  options: { allowUnknownBody: false },
  body: {
    name: Joi.string(),
    authors: Joi.string(),
    page: Joi.number().required(),
    numberitem: Joi.number(),
  },
};
export const VALIDATION_HIDDEN_COMIC = {
  options: { allowUnknownBody: false },
  body: {
    id: Joi.number().required(),
  },
};
export const VALIDATION_SHOW_COMIC = {
  options: { allowUnknownBody: false },
  body: {
    id: Joi.number().required(),
  },
};
export const VALIDATION_LIST_TOP = {
  options: { allowUnknownBody: false },
  body: {
    type: Joi.number().valid([1,2,3]),
  },
};
export const VALIDATION_GET_LIST_BY_GENDERS = {
    options: { allowUnknownBody: false },
    body: {
      page: Joi.number().required(),
      numberitem: Joi.number(),
      genres: Joi.string(),
      status:Joi.number().valid([0,1,2])
    },
}