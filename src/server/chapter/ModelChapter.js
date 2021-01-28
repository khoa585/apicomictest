import request from "request-promise";
import cheerio from "cheerio";
const Chapter = require("../../model/chapter");
import { getData, putData } from "../../common/cache";
import { getDataRedis, setDataRedis } from "./../../common/redis";
import chapter from "../../model/chapter";
const getImageLinks = async (uri) => {
  try {
    const response = await request.get(uri);
    const $ = await cheerio.load(response);
    let imageLinks = [];
    $(".page-chapter img").each(function (i, elem) {
      let image = $(this).attr("data-original");
      if (!image) {
        image = $(this).attr("src");
      }
      imageLinks[i] = image;
    });

    return imageLinks;
  } catch (error) {
    console.log(error);
  }
};

export const getChapterByID = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId).populate({
    path: "comic_id",
    select: "name image",
  });
  if (chapter.images.length === 0) {
    const images = await getImageLinks(chapter.url);
    chapter.images = [...images];
  }
  chapter.views++;
  await chapter.save();
  const key = chapter.comic_id;
  const valueCache = getData(key);
  if (valueCache) {
    return { chapter, listChapters: valueCache };
  }
  const comic = await Chapter.find({
    comic_id: chapter.comic_id,
  })
    .sort({ index: -1 })
    .select("_id name index views");
  const listChapters = comic;
  putData(key, listChapters);
  return { chapter, listChapters };
};
Date.prototype.getWeek = function () {
  var oneJan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil(((this - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
};

export const setViewsRedis = async (comicId) => {
  const time = new Date();
  const TOP_MONTH = `TOP_MONTH-${time.getMonth()}-${time.getFullYear()}`;
  const TOP_WEK = `TOP_WEK-${time.getWeek()}-${time.getFullYear()}}`;
  const TOP_DAY = `TOP_DAY-${time.getDate()}-${time.getMonth()}-${time.getFullYear()}`;
  await Promise.all([
    setDataToTop(TOP_DAY, comicId),
    setDataToTop(TOP_MONTH, comicId),
    setDataToTop(TOP_WEK, comicId),
  ]);
};
const setDataToTop = async (key, comicId) => {
  let dataGet = await getDataRedis(key);
  if (dataGet) {
    dataGet = JSON.parse(dataGet);
    if (dataGet[comicId]) {
      dataGet[comicId]++;
    } else {
      dataGet[comicId] = 1;
    }
  } else {
    dataGet = {};
    dataGet[comicId] = 1;
  }
  await setDataRedis(key, JSON.stringify(dataGet));
};
export const getInfoChapterById = (id)=>{
    return chapter.findById(id);
}
