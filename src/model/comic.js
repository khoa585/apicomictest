let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let commic = new Schema(
  {
    url: String,
    name: String,
    alternative: String,
    authors: String,
    image: {
      type: String,
    },
    status: Number,
    views: Number,
    genres: [
      {
        type: String,
      },
    ],
    description: String,
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: "chapter",
      },
    ],
    enable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("comic", commic);
