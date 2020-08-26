const mongoose = require('mongoose')
const Schema = mongoose.Schema

const _Home = new Schema(
    {
        user:{type:String},
        Posts:[{post:{type:String},user:{type:String},createat:{type: Date, default: Date.now()}}]
    }
)

const mymodel = mongoose.model('Home',_Home)
module.exports=mymodel