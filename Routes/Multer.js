const multer = require('multer')
const upload = multer({limits:{fieldSize:1600000},fileFilter(req,file,cb){
    console.log(file.originalname);
        

    if(!file.originalname.match(/\.(png|jpeg|jpg)$/))
    {
       
        
        return cb(new Error('please upload image '))

    }
    cb(undefined,true)
}})
module.exports = upload