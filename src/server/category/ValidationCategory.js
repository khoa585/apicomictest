import  Joi from 'joi';
export const VALIDATION_CREATE_CATEGORY ={
    options: {allowUnknownBody: false},
    body:{
        name:Joi.string().required(),
        description:Joi.string().required(),
        url:Joi.string().required(),
        image:Joi.string()
    }
}
