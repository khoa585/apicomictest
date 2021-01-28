require("dotenv").config();
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cros from "cors";
import responseTime from "response-time";
import logger from "morgan";
import mongoose from "mongoose";
import router from "./server/index";
import { responseHelper } from "./common/responsiveHelper";
import authentication, { Authorization } from "./common/authentication";
import { FAIL_VALIDATION } from "./constant/error";
if (process.env.DEV == "development") {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (error) => {
      if (error) {
        console.log(error);
        console.log("Thất Bại");
      } else {
        console.log("Connect successed to mongo");
      }
    }
  );
} else {
  mongoose.connect(
    `mongodb://${process.env.MONGO_SERVER}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (error) => {
      if (error) {
        console.log(error);
        console.log("Thất Bại");
      } else {
        console.log("Connect successed to mongo DEV");
      }
    }
  );
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "./src/uploads/images",
  express.static(path.join("src", "uploads", "images"))
);
app.use(bodyParser.json());
app.use(cros());
app.use(responseTime());
app.use(authentication);
app.use(Authorization);
app.use(logger("dev"));
app.set("trust proxy", true);
app.use("/", router);
app.use(function (err, req, res, next) {
  if (err.message == "validation error") {
    return responseHelper(
      req,
      res,
      {
        ms: FAIL_VALIDATION,
        detail: err.errors,
      },
      null
    );
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("App Running On Port : " + process.env.PORT || 3000);
});
