const mongoose = require("mongoose")
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/auth")

const authSchema = mongoose.Schema({
  username : String,
  password : String,
  email : String,
  age: String,
  img : {
    type : String,
    default : "def.png"
  },
  contact  :String,
  posts : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "post"
  }]
})
authSchema.plugin(plm)
module.exports = mongoose.model("user",authSchema)