let mongoose = require("mongoose");
let Schema = mongoose.Schema ;
let category = new Schema({
    name:String,
    description:String,
    url:String,
    image:String
},
{timestamps:true}
)
module.exports = mongoose.model("category",category);