require("dotenv").config();
let request = require("request-promise");
let cheerio = require("cheerio");
let mongoose = require("mongoose");
var schedule = require('node-schedule');
var comicDb = require("./../model/comic");
var chapterDb = require("./../model/chapter");
const URL_UPDATE ="http://www.nettruyen.com";
mongoose.connect(`mongodb://${process.env.MONGO_SERVER}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {useNewUrlParser: true,useUnifiedTopology: true ,useCreateIndex: true},(error)=>{
if(error){
    console.log(error);
    console.log('Thất Bại');
}else {
    console.log('Connect successed to mongo');
}
});

const getListUpdate =  async()=>{
    let data = await request(URL_UPDATE);
    const $ = cheerio.load(data);
    let listCommic = $(".item");
    let listLink = [];
    listCommic.each(function(i,element){
        let linkCommic = cheerio.load(element)("figure > div > a ").attr("href");
        if(linkCommic) {
            listLink.push(linkCommic);
        }
       
    })
    console.log("Số Lượng Link Cần Update:" + listLink.length);
    let listComic = await comicDb.find({
        url:{$in:listLink},
        enable:true
    }).populate({path:"chapters",select:"-images"})
    //console.log(listComic[0]);
    let promiseArray  = listComic.map((item)=>{
        return fetchNewsChapter(item)
    })
    let resultArray = await Promise.all(promiseArray);
    let listArray =[];
    resultArray.forEach((item)=>{
        item.forEach(item2=>listArray.push(item2))
    })
    let chapterPromise = listArray.map((item)=>{
        return AddChapter(item.url,item.name,item.views,item.index,item.comic_id);
    })
    let dataAddChapter = await Promise.all(chapterPromise);
    console.log("Update Thành Công : "+ dataAddChapter.length + " chapter" );
}
const fetchNewsChapter =async (comic)=>{
    let listChapterOld = comic.chapters.map(item=>item.url);
    // console.log(listChapterOld)
    let data = await request(comic.url);
    const $ = cheerio.load(data);
    let listChapter = [];
    let chapterSelect = $("#nt_listchapter > nav > ul>li:not(:first-child)");
    chapterSelect.each(function(i,element){
        let object = {};
        let elementDetial = cheerio.load(element) ;
        object.url = elementDetial("div.col-xs-5.chapter > a").attr("href");
        object.name = elementDetial("div.col-xs-5.chapter").text().replace(/\n/g, "");
        object.views = elementDetial("div.col-xs-3.text-center.small").text().replace(".","");
        if( object.url){
            listChapter.push(object);
        }
    })
    // console.log(listChapterOld.length);
    // console.log(listChapter.length);
    let list = listChapter.filter(e => !listChapterOld.includes(e.url));
    // console.log(list , comic.url);
    let listResult = [];
    for(let i=0 ;i<list.length;i++){
        listResult.push({
            url:list[i].url,
            comic_id:comic._id,
            name:list[i].name,
            views:list[i].views,
            index:listChapterOld.length+i+1
        })
    }
    return listResult ;

}
const AddChapter = async(url,name,views,index,comic_id)=>{
    let chapterCreate = await chapterDb.create({
        url:url,
        name:name,
        comic_id:comic_id,
        index:index,
        views:views
    })
    let commicUpdate = await comicDb.updateOne({_id:comic_id},{
        "$push": {
            "chapters": chapterCreate._id
        }
    })
    return url ;
}
let i = schedule.scheduleJob("*/30 * * * *",async()=>{
    getListUpdate();
})
