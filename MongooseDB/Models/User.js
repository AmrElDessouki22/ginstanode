const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var validator = require('validator');


const _User = new Schema(
    {
        
        password:{type:String,required:true,validate(password){
            if(!validator.isLength(password, {min:6})||validator.isEmpty(password, {ignore_whitespace:true}))
            {
                throw new Error(" cant be less than 6 characters")
            }
        }},
        profilepic:{type:Buffer},
        email:{type:String,required:true,unique:true,validate(email){
            if(!validator.isEmail(email))
            {
                console.log(value);
                throw new Error(" must be email format")
            }
        }},
        name:{type:String,required:true},
        phone:{type:String},
        gender:{type:String},
        age:{type:String},
        Token:[{token:{type:String}}],

    }
)
_User.methods.toJSON = function()
{
    const user = this
    const object = user.toObject()
    delete object.password
    delete object.Token
    return object

}
_User.statics.Checkuser =async (email,password)=>
{
    try{
       
        const _email = await mymodel.findOne({email:email})
    
        
        if(!_email)
        {
            throw new Error("can't login ")
        }
        const _password = await bcrypt.compare(password,_email.password)
        if(!_password)
        {
            throw new Error("can't login ")

        }
        
      
        
        return _email

    }catch(e)
    {

    }
}
_User.methods._Token = async function(){
   try{
    const user = this
    const token = jwt.sign({ id: user._id }, process.env.hasnaa);
    user.Token = await user.Token.concat({token:token})
    await user.save()
    return token

   }catch(e)
   {
       throw new Error(e.message)
   }
}
_User.pre('save',async function(next)
{
    const user = this
    if(user.isModified('password'))
    {
        const hash = await bcrypt.hash(user.password, 8);
        user.password = hash

    }
    next()
})


const mymodel = mongoose.model('user',_User)
module.exports=mymodel
