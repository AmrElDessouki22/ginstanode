const user = require('../MongooseDB/Models/User')
const jwt = require('jsonwebtoken')

const auth =async (req,res,next)=>
{

    try
    {
        const header_token = await req.header('Authorization').replace('Bearer ','')
        const decode_token = jwt.verify(header_token, process.env.JWTPASS)
        const _user = await user.findOne({_id:decode_token.id})        
        if(!_user)
        {
            throw new Erorr('verfy failed')
        }
        req.user = _user
        req.token = decode_token
        next()
        
    }catch(e)
    {
        
        res.status(401).send()
    }
}
module.exports = auth
