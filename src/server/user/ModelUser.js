const User = require("../../model/user");
import { encodeToken } from "../../common/jwtHelper";
import request from "request-promise";
// import nodemailer from "nodemailer";

import {
  USER_NOT_MATCHED,
  EMAIL_TAKEN,
  PASSWORD_NOT_MATCHED,
} from "../../constant/error";
const FB_API_URL =
  "https://graph.facebook.com/me?fields=picture,name,email&access_token=";
const GOOGLE_API_URL =
  "https://www.googleapis.com/oauth2/v2/userinfo?access_token=";

export const userLogin = async (userData) => {
  const user = await User.findOne({ "local.email": userData.email }).select(
    "-comics_following"
  );
  if (!user) {
    throw new Error(USER_NOT_MATCHED);
  } else {
    const valid = await user.comparePassword(userData.password);
    if (!valid) {
      throw new Error(PASSWORD_NOT_MATCHED);
    }
    let userInfo = user.toObject();
    delete userInfo.local.password;
    let token = encodeToken(userInfo);
    delete userInfo._id;
    return { userInfo, token };
  }
};

export const userFacebookLogin = async (accessToken) => {
  let userInfo;
  const url = FB_API_URL + accessToken;
  const response = await request.get(url);
  const userData = JSON.parse(response);

  if (!userData) throw new Error(USER_NOT_MATCHED);
  const userExisting = await User.findOne({ "facebook.id": userData.id });
  if (!userExisting) {
    const user = new User({
      method: "facebook",
      first_name: userData.first_name,
      last_name: userData.last_name,
      facebook: {
        id: userData.id,
        email: userData.email,
      },
      avatar: userData.picture.data.url,
    });
    await user.save();
    userInfo = user.toObject();
  } else {
    userInfo = userExisting.toObject();
  }
  const token = encodeToken(userInfo);
  delete userInfo._id;
  return { userInfo, token };
};

export const userGoogleLogin = async (accessToken) => {
  const url = GOOGLE_API_URL + accessToken;
  let userInfo;

  const response = await request.get(url);
  const userData = JSON.parse(response);

  if (!userData) throw new Error(USER_NOT_MATCHED);
  const userExisting = await User.findOne({ "google.id": userData.id });
  if (!userExisting) {
    const user = new User({
      method: "google",
      google: {
        id: userData.id,
        email: userData.email,
      },
      first_name: userData.family_name,
      last_name: userData.given_name,
      avatar: userData.picture,
    });
    await user.save();
    userInfo = user.toObject();
  } else {
    userInfo = userExisting.toObject();
  }

  const token = encodeToken(userInfo);
  delete userInfo._id;
  return { userInfo, token };
};

export const userRegister = async (userData) => {
  const user = await User.findOne({ "local.email": userData.local.email });
  if (!user) {
    const newUser = await User(userData);
    await newUser.save();
    let userInfo = newUser.toObject();
    const token = encodeToken(userInfo);

    delete userInfo._id;
    return { userInfo, token };
  } else {
    throw new Error(EMAIL_TAKEN);
  }
};

export const getUserInfoById = async (idUser) => {
  return await User.findById(idUser);
};

export const uploadAvatar = async (userId, path) => {
  const user = await User.findById(userId);
  user.avatar = path;
  await user.save();
};

// export const forgetPassword = async (email) => {
//   nodemailer.createTestAccount((err, account) => {
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_PASS,
//       },
//     });
//     const emailOptions = {
//       from: `"Duong Chu" <duongchulik95@gmail.com>`,
//       to: "chu.duong.dev@gmail.com",
//       subject: "forgetPassword",
//       text: "Hello"
//     }
//   });

// };
