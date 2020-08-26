const mongoose = require('mongoose')
const Schema = mongoose.Schema

const _Post = new Schema(
    {
        user:{type:String},
        posts:[{

            caption:{type:String}
            ,photo:{type:Buffer},
            like:[{like:{type:String}}],
            comment:[{user:{type:String},comment:{type:String}}],
            video:{type:Buffer},
            createat:{type:Date,default:Date.now()}

        }]
    },{timestamps:true}
)
const mymodel = mongoose.model('Post',_Post)
module.exports = mymodel