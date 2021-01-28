import jwt from "jsonwebtoken";
import { ERROR_AUTHEN } from "../constant/error";
require("dotenv").config();

const secretKey = process.env.SECRET_KEY || "1321nduadnkwdnwwadwdw";

export const verifyToken = (token) => {
  let result ;
  try {
     result = jwt.verify(token, secretKey);
  } catch (error) {

  }
  if (!result) throw new Error(ERROR_AUTHEN);
  return result;
};
export const encodeToken = (data) => {
  const token = jwt.sign(data, secretKey, {
    expiresIn: 60 * 60 * 1000,
  });

  return token;
};
  