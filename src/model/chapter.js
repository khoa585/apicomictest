let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let chapter = new Schema(
  {
    url: String,
    name: String,
    comic_id: {
      type: Schema.Types.ObjectId,
      ref: "comic",
    },
    images: [String],
    index: Number,
    views: Number,
    enable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
chapter.indexes({ comic_id: 1 });
module.exports = mongoose.model("chapter", chapter);
