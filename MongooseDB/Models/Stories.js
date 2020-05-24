const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const _stories = new Schema({
    user:{type:String},
    photo:[{photo:{type:Buffer},createat:{type:Date,defult:Date.now()}}]
})
const model = mongoose.model('Stories',_stories)
module.exports=model