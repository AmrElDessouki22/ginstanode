const mongoose = require('mongoose')
const Schema = mongoose.Schema

const _Folowers = new Schema(
    {
        user:{type:String},
        followers:[{follow:{type:String}}]
    }
)

const mymodel = mongoose.model('Following',_Folowers)
module.exports = mymodel