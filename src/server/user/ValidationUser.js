import Joi from "joi";

export const USER_REGISTER_VALIDATION = {
  options: { allowUnknownBody: false },
  body: {
    local: Joi.object({
      repeat_password: Joi.ref("password"),
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required(),
      password: Joi.string().min(6).required(),
    }),
    method: Joi.string().required(),
    gender: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
  },
};

export const USER_LOGIN_VALIDATION = {
  options: { allowUnknownBody: false },
  body: {
    password: Joi.string().min(6).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
  },
};

export const ACCESS_TOKEN_VALIDATION = {
  options: { allowUnknownBody: false },
  body: {
    access_token: Joi.string().required(),
  },
};
