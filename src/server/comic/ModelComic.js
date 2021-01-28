const ComicDb = require("../../model/comic");
import { getData, putData } from "./../../common/cache";
import { getDataRedis } from "./../../common/redis";

export const getComicById = async (comicId) => {
  const comic = await ComicDb.findById(comicId).populate({
    path: "chapters",
    select: {
      name: 1,
      views: 1,
      updatedAt: 1,
      createdAt: 1,
    },
    options: {
      sort: { index: -1 },
    },
  });
  return comic;
};

export const getListComicsByGenres = async (genres, page, numberitem,status) => {
  let valueCache;
  const key = `${genres}-${page}-${numberitem}-${status}`;
  valueCache = getData(key);
  if (valueCache) {
    return valueCache;
  } else {
    let query = {}
    if(genres){
      query.genres = { $regex:genres,$options:"i"}
    }
    if(status!=2 && status != undefined){
      query.status=status;
    }
    let comics = await ComicDb
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * numberitem)
      .limit(numberitem)
      .populate({
        path: "chapters",
        select: ["name", "updatedAt", "views", "createdAt"],
      });
    comics = comics.map((item) => {
      item.chapters = item.chapters.reverse().slice(0, 3);
      return item;
    });
    let numberItem = await ComicDb.countDocuments(query);
    putData(key, {comics,numberItem});
    return {
      comics,
      numberItem
    };
  }
};
export const getListComics = async (type, page, numberItem) => {
  let result;

  let key = `${type}-${page}-${numberItem}`;
  let valueCache = getData(key);
  if (valueCache) {
    return valueCache;
  }
  if (type === 1) {
    result = await ComicDb.find({
      enable: true,
    })
      .sort({ views: -1 })
      .skip((page - 1) * numberItem)
      .limit(numberItem)
      .populate({
        path: "chapters",
        select: ["name", "updatedAt", "views", "createdAt"],
      });
  } else {
    result = await ComicDb.find({
      enable: true,
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * numberItem)
      .limit(numberItem)
      .populate({
        path: "chapters",
        select: ["name", "updatedAt", "views", "createdAt"],
      });
  }
  let total = await ComicDb.countDocuments();
  let data = result.map((item) => {
    item.chapters = item.chapters.reverse().slice(0, 3);
    return item;
  });

  putData(key, { data, total });
  return { data, total };
};

export const searchListComics = async (name, authors, page, numberitem) => {
  const key = `${name}-${authors}-${page}-${numberitem}`;
  let valueCache = getData(key);
  if (valueCache) {
    return valueCache;
  }
  let regex;
  let query = {
    enable: true,
  };

  if (name.trim().length) {
    regex = new RegExp(name);
    query["name"] = { $regex: regex, $options: "i" };
  }
  if (authors.trim().length) {
    regex = new RegExp(authors);
    query["authors"] = { $regex: regex, $options: "i" };
  }

  const result = await ComicDb.find(query)
    .skip((page - 1) * numberitem)
    .limit(numberitem)
    .populate({ path: "chapters", select: ["name", "updateAt", "views"] });
  const comics = result.map((item) => {
    item.chapters = item.chapters.reverse().slice(0, 3);
    return item;
  });

  const total = (await ComicDb.find(query)).length;
  putData(key, { comics, total });
  return { comics, total };
};
export const getListTop = async (type) => {
  let key = `LIST_TOP-${type}`;
  let dataCache = getData(key);
  if (dataCache) return dataCache;
  const time = new Date();
  let keyRedis;
  //type 1: MonTh
  //type 2 : Wek
  //type 3: Day
  if (type == 1) {
    keyRedis = `TOP_MONTH-${time.getMonth()}-${time.getFullYear()}`;
  } else if (type == 2) {
    keyRedis = `TOP_WEK-${time.getWeek()}-${time.getFullYear()}}`;
  } else {
    keyRedis = `TOP_DAY-${time.getDate()}-${time.getMonth()}-${time.getFullYear()}`;
  }
  let dataRedis = await getDataRedis(keyRedis);
  if (!dataRedis) {
    return [];
  }
  dataRedis = JSON.parse(dataRedis);
  let objectTop = [];
  for (let property in dataRedis) {
    objectTop.push({
      id: property,
      views: dataRedis[property],
    });
  }
  let listComicTop = objectTop.sort((a, b) => {
    if (a.views > b.views) return -1;
    if (a.views < b.views) return 1;
    return 0;
  });
  listComicTop = listComicTop.slice(0, 5);
  let listId = listComicTop.map((item) => item.id);
  let listComicResult = await ComicDb.find({
    _id: { $in: listId },
  })
    .populate({
      path: "chapters",
      select: ["name", "updatedAt", "views", "createdAt"],
      options: {
        sort: { index: -1 },
      },
      perDocumentLimit: 1,
    })
    .select("-genres -url -enable -status -description");
  listComicResult = listComicResult.map((comic) => {
    comic = comic.toObject();
    listComicTop.forEach((item) => {
      if (item.id == comic._id.toString()) {
        comic.views_top = item.views;
      }
    });
    return comic;
  });
  listComicResult = listComicResult.sort((a, b) => {
    if (a.views_top > b.views_top) return -1;
    if (a.views_top < b.views_top) return 1;
    return 0;
  });
  putData(key, listComicResult);
  return listComicResult;
};
