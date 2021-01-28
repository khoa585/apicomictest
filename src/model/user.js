const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    first_name: String,
    last_name: String,
    gender: {
      type: String,
      enum: ["male", "female"],
    },

    method: {
      type: String,
      enum: ["local", "google", "facebook"],
      required: true,
    },
    local: {
      email: String,
      password: String,
    },
    google: {
      id: String,
      email: String,
    },
    facebook: { email: String, id: String },
    avatar: { type: String, default: "" },
    role: { type: Number, default: 1 },
    comics_following: [
      {
        type: Schema.Types.ObjectId,
        ref: "comic",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.method !== "local") next();
  this.local.password = await bcrypt.hash(this.local.password, 12);
  next();
});

userSchema.method("comparePassword", async function (password) {
  const result = await bcrypt.compare(password, this.local.password);
  return result;
});

module.exports = mongoose.model("user", userSchema);
