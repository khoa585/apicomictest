const request = require("request-promise");
let cheerio = require("cheerio");
let commicDb = require("../model/comic");
let chapterDb = require("../model/chapter");
const URL_PAGE="http://www.nettruyen.com/?page=";
 const getListInLink= async (page)=>{
    let url = URL_PAGE + page;
    let resultData = await request(url);
    let $ = cheerio.load(resultData);
    let listCommic = $(".item");
    let listLink = [];
    listCommic.each(function(i,element){
        let linkCommic = cheerio.load(element)("figure > div > a ").attr("href");
        if(linkCommic) {
            listLink.push(linkCommic);
        }
       
    })
    let listPromise = listLink.map(item=>addCommic(item));
    let dataPromise = await Promise.all(listPromise);
    console.log(dataPromise.length);
    return dataPromise.length ;
}
const getDetialComic =  async (url,commicId)=>{
    let data = await  request({
        uri:url
    })
    const $ = cheerio.load(data);
    let listChapter =[];
    const listGenders = [];
    let objects ={};
    objects["name"]= $("#item-detail > h1").text();
    objects["author"]=$("#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.author.row > p.col-xs-8").text();
    let status = $("#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.status.row > p.col-xs-8").text();
    if(status=="Đang tiến hành"){
        objects["status"]=0;
    }else {objects["status"]=1; }
    objects["image"]= $("#item-detail > div.detail-info > div > div.col-xs-4.col-image > img").attr("src");
    let genders = $("#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.kind.row > p.col-xs-8>a");

    genders.each(function(i,element){
        listGenders.push(cheerio.load(element).text());
    })
    objects["genres"]= listGenders ;
    objects["description"]=$("#item-detail > div.detail-content > p").text();
    // console.log(objects);
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
    
    listChapter = listChapter.reverse();
    // console.log(listChapter);
    await commicDb.updateOne({_id:commicId},objects);
    let listPromise = listChapter.map((item,index)=>AddChapter(item.url,item.name,item.views,index+1,commicId));
    let dataResult = await Promise.all(listPromise);
    return {total:listChapter.length,update:dataResult.length} ;
}
const addCommic = (Link)=>{
    return commicDb.create({url:Link});
}
const listCommitNotUpdate= ()=>{
    return commicDb.find({
        $or:[
            {
                description:{ $exists: false }
            },
            {
                chapters:{$size:0}
            }
        ]

    })
}
const AddChapter = async(url,name,views,index,comic_id)=>{
    let chapterCreate = await chapterDb.create({
        url:url,
        name:name,
        comic_id:comic_id,
        index:index,
        views:views
    })
    let commicUpdate = await commicDb.updateOne({_id:comic_id},{
        "$push": {
            "chapters": chapterCreate._id
        }
    })
    return url ;
}
module.exports = {
    getListInLink,
    getDetialComic,
    listCommitNotUpdate
}