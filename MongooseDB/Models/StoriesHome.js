const mongoose = require('mongoose')
const Schema = mongoose.Schema

const _StoriesHome = new Schema(
    {
        user:{type:String},
        Stories:[{storie:{type:String},user:{type:String},createat:{type: Date, default:Date.now()}}]
    }
)

const mymodel = mongoose.model('StoriesHome',_StoriesHome)
module.exports=mymodel