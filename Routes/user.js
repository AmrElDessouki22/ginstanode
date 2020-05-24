const express = require('express')
const app = new express.Router
const user = require('../MongooseDB/Models/User')
const MiddlewareUser = require('../Middleware/auth')
const Following = require('../MongooseDB/Models/Following')
const Follower = require('../MongooseDB/Models/Follower')
const Home = require('../MongooseDB/Models/Home')
const Post = require('../MongooseDB/Models/Post')
const Stories = require('../MongooseDB/Models/Stories')
const StoriesHome = require('../MongooseDB/Models/StoriesHome')
const upload = require('../Routes/Multer')
const sharp = require('sharp')
var mongoose = require('mongoose');

app.post('/register',async (req,res)=>
{

    
    try{
        const _adduser = await user(req.body).save()
        await Following({user:_adduser._id}).save() 
        await Post({user:_adduser._id}).save() 
        await Follower({user:_adduser._id}).save()
        await Stories({user:_adduser._id}).save()
        await StoriesHome({user:_adduser._id}).save()
        await Home({user:_adduser._id}).save()
        res.status(200).send(_adduser)
    }catch(e)
    {
        res.status(401).send(e.message)
    }
    
})
app.post('/login',async (req,res)=>
{
    try{
        const _adduser =  await user.Checkuser(req.body.email,req.body.password)
        const token = await _adduser._Token()
        res.status(200).send(token)
    }catch(e)
    {
        res.status(401).send(e.message)
    }
    
})
app.patch('/updateuser',MiddlewareUser,async (req,res)=>
{
    const keys = Object.keys(req.body)
    const allaw = ['password','email','name','age','gender','phone']
    const check = keys.every((key)=>allaw.includes(key))
    
    try{
        if(!check)
        {
            throw new Error('key not include update doesnt compelet ')

        }
        keys.forEach((key)=>
        {
            req.user[key] = req.body[key]

        })
        const updateUser = await req.user.save()
        
        res.status(200).send(updateUser)
    }catch(e)
    {
        res.status(401).send(e.message)
    }
    
})
app.post('/logout',MiddlewareUser, async (req, res)=> 
{
    try{
        req.user.Token = []
        await req.user.save()
        res.status(200).send('log out done ! we wish see you soon ^_^')


    }catch(e)
    {
        res.status(400).send(e.message)

    }
  })
  app.get('/checkuser',MiddlewareUser, async (req, res)=> 
{
    try{
        
        res.status(200).send()

    }catch(e)
    {

        res.status(400).send(e.message)

    }
  })
  app.get('/photo/:post/:user', async (req, res)=> 
{
    try{
        
        const post_ = await Post.findOne({user:req.params.user})
        await post_.posts.forEach(element => {
            if(req.params.post == element._id.toString())
            {
                res.set('Content-Type','image/jpg')
                res.status(200).send(element.photo)
            }
            
        });

    }catch(e)
    {

        res.status(400).send(e.message)

    }
  })

  app.get('/photo/:user', async (req, res)=> 
  {
      try{
          
        const user_ = await user.findById(req.params.user)
         
        res.set('Content-Type','image/jpg')
        res.status(200).send(user_.profilepic)
  
      }catch(e)
      {
  
          res.status(400).send(e.message)
  
      }
    })
    app.post('/addphoto',MiddlewareUser,upload.single('avatar'), async (req, res)=> 
  {
      try{
        const file = await sharp(req.file.buffer)
        .rotate()
        .png()
        .toBuffer()
        if(req.file.size>1600000)
        {
            throw new Error('image is heavy ax size 1.6 MB')
        }
        const user_ = await user.findById(req.user._id)
        user_.profilepic = file
        await user_.save()
        res.status(200).send()
  
      }catch(e)
      {
  
          res.status(400).send(e.message)
  
      }
    })
    
app.post('/follow/:id',MiddlewareUser, async (req, res)=> {
    try{

        const GetFollowNode = await Following.findOne({user:req.user._id})
        GetFollowNode.followers = GetFollowNode.followers.concat({follow:req.params.id})
        const add_to_ontherUser_Follower = await Follower.findOne({user:req.params.id})
        add_to_ontherUser_Follower.followers = add_to_ontherUser_Follower.followers.concat({follow:req.user._id})
        const ontherUser_posts = await Post.findOne({user:req.params.id})
        const myhome = await Home.findOne({user:req.user._id})
        await ontherUser_posts.posts.forEach(async element => {
            
            myhome.Posts = await myhome.Posts.concat({post:element._id.toString(),user:req.params.id.toString(),createat:element.createdAt})
        });
        ///
        const ontherUser_Stories = await Stories.findOne({user:req.params.id})
        const myhomestories = await StoriesHome.findOne({user:req.user._id})
        await ontherUser_Stories.photo.forEach(async element => {
            myhomestories.Stories = await myhomestories.Stories.concat({storie:element._id.toString(),user:req.params.id.toString(),createat:element.createdAt})
        });
        ///
        if(myhome != undefined){
            await myhome.save()
        }
        if(myhomestories != undefined){
            await myhomestories.save()
        }
        
        await ontherUser_Stories.save()
        await GetFollowNode.save()
        await add_to_ontherUser_Follower.save()
        res.status(200).send('follow done !')
    }catch(e)
    {
        res.status(400).send(e.message)
    }
  })
  app.post('/unfollow/:id',MiddlewareUser, async (req, res)=> {
    try{
        const GetFollowNode = await Following.findOne({user:req.user._id})
        GetFollowNode.followers = await GetFollowNode.followers.filter((t)=>
        {
            return t.follow  !== req.params.id
        })
        const find_unfollow_user = await Home.findOne({user:req.user._id})
        find_unfollow_user.Posts = await find_unfollow_user.Posts.filter(t =>
            {
                return t.user !== req.params.id
            })
        const find_unfollow_StoriesHome = await StoriesHome.findOne({user:req.user._id})
        find_unfollow_StoriesHome.Stories = await find_unfollow_StoriesHome.Stories.filter(t =>
            {
                return t.user !== req.params.id
            })    
        const get_our_following_user =  await Follower.findOne({user:req.params.id})
        
        get_our_following_user.followers = await get_our_following_user.followers.filter(t=>
            {
                return t.follow !== req.user._id.toString()
            })
        await get_our_following_user.save()
        await find_unfollow_user.save()    
        await GetFollowNode.save()
        await find_unfollow_StoriesHome.save()
        res.status(200).send('unfollow done !')
    }catch(e)
    {
        res.status(400).send(e.message)

    }
  })

  app.post('/addpost/:caption',MiddlewareUser,upload.single('avatar'), async (req, res)=> 
  {
      try
      {
        
        console.log('k');
        
        const file = await sharp(req.file.buffer)
        .rotate()
        .resize({width:200,height:400})
        .png()
        .toBuffer()
        if(req.file.size>1600000)
        {
            throw new Error('image is heavy ax size 1.6 MB')
        }
        var get_followers_post
        var id = mongoose.Types.ObjectId();
        const addpost = await Post.findOne({user:req.user._id})        
        addpost.posts = await addpost.posts.concat({_id:id,photo:file,caption:req.params.caption})
        const home_ = await Home.findOne({user:req.user._id})
        home_.Posts = await home_.Posts.concat({post:id,user:req.user._id})
        const followers = await Follower.findOne({user:req.user._id})
        
        await followers.followers.forEach( async element => {
             get_followers_post = await Home.findOne({user:element.follow})
             get_followers_post.Posts = await get_followers_post.Posts.concat({post:id,user:req.user._id})
        });
        await addpost.save()
        await home_.save()
        if(get_followers_post != undefined)
        {
        await get_followers_post.save()
        }
        res.status(200).send('post done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })


  app.post('/addstorie',MiddlewareUser,upload.single('avatar'), async (req, res)=> 
  {
      try
      {
        const file = await sharp(req.file.buffer)
        .rotate()
        .resize({width:200,height:400})
        .png()
        .toBuffer()
        if(req.file.size>1600000)
        {
            throw new Error('image is heavy max size 1.6 MB')
        }
        var get_followers_storie
        var id = mongoose.Types.ObjectId();
        const addstorie = await Stories.findOne({user:req.user._id})
        addstorie.photo = await addstorie.photo.concat({_id:id,photo:file,createat:Date.now()})
        const storieshome = await StoriesHome.findOne({user:req.user._id})
        storieshome.Stories = await storieshome.Stories.concat({storie:id,user:req.user._id})
        const followers = await Follower.findOne({user:req.user._id})
        await followers.followers.forEach( async element => {
            get_followers_storie = await StoriesHome.findOne({user:element.follow})
            get_followers_storie.Stories = await get_followers_storie.Stories.concat({storie:id,user:req.user._id})
        });
        await addstorie.save()
        await storieshome.save()
        if(get_followers_storie != undefined)
        {
        await get_followers_storie.save()
        }
        res.status(200).send('post done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })


  app.get('/myposts',MiddlewareUser, async (req, res)=> 
  {
      var coll_posts = []
      try
      {
        // get followers and add post to every one in their home model
        const mypost = await Post.findOne({user:req.user._id})        
        mypost.posts.forEach( function(element , ind,arr){
            coll_posts.push(element)
            if(ind === arr.length - 1)
            {
                return res.status(200).send(coll_posts)
            }
            
        });
        if(mypost.posts.length == 0)
        {
            return res.status(200).send(coll_posts)

        }
        
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })

  app.get('/userposts/:user',MiddlewareUser, async (req, res)=> 
  {
      var coll_posts = []
      try
      {
        // get followers and add post to every one in their home model
        const mypost = await Post.findOne({user:req.params.user})        
        mypost.posts.forEach( function(element , ind,arr){
            coll_posts.push(element)
            if(ind === arr.length - 1)
            {
                return res.status(200).send(coll_posts)
            }
            
        });
        if(mypost.posts.length == 0)
        {
            return res.status(200).send(coll_posts)

        }
        
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })

  app.get('/profile/:id',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const _user = await user.findById(req.params.id)     
        res.status(200).send(_user)
        
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })
  app.patch('/edit/:id',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const addpost = await Post.findOne({user:req.user._id})    
        await addpost.posts.forEach(element => {
            if(element._id == req.params.id)
            {
                element.caption = req.body.caption
            }
        });
        await addpost.save()
        res.status(200).send('post done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })
  app.post('/like/:iduser/:idpost',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const likepost = await Post.findOne({user:req.params.iduser})        
        await likepost.posts.forEach(async element => {
            if(element._id.toString() == req.params.idpost)
            {
             element.like = await element.like.concat({like:req.user._id})
            }
        });    
        await likepost.save()  
        res.status(200).send('like done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.post('/unlike/:iduser/:idpost',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const unlikepost = await Post.findOne({user:req.params.iduser})        
        await unlikepost.posts.forEach(async element => {
            if(element._id.toString() == req.params.idpost)
            {
             element.like = await element.like.filter(t=> {
                return t.like !== req.user._id.toString()
            })
            }
        });    
        await unlikepost.save()  
        res.status(200).send('unlike done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.post('/comment/:iduser/:idpost',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const likepost = await Post.findOne({user:req.params.iduser})        
         await likepost.posts.forEach(async element => {
            if(element._id.toString() == req.params.idpost)
            {
             element.comment = await element.comment.concat({user:req.user._id,comment:req.body.comment})
            }
        });    
        //likepost.like = await likepost.like.concat({like:req.user._id})
        await likepost.save()
  
        res.status(200).send('comment done')
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })
  app.get('/comment/:iduser/:idpost',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const likepost = await Post.findOne({user:req.params.iduser})        
        await likepost.posts.forEach(async element => {
            if(element._id.toString() == req.params.idpost)
            {
                res.status(200).send(element.comment)
            }
        }); 
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })
  app.get('/myinfo',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        res.status(200).send(req.user)      
        
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
    

  })
  app.get('/gethome',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const home = await Home.findOne({user:req.user._id})
        const home_arr =  home.Posts
        if(home_arr == [])
        {
           return  res.status(200).send('dont have posts')
        }
        var collposts =  []
         home_arr.forEach (async function(posts,ind,array){
        const post_ = await Post.findOne({user:posts.user})
        const spcei_post_arr = post_.posts
        spcei_post_arr.forEach( async posts_ => {
            if(posts_._id==posts.post)
            {
                if(posts_.like.length == 0)
                {
                    collposts.push({posts_,user:posts.user,liked:false})

                }else{
                await posts_.like.forEach(function(element) {
                    if(req.user._id.toString()==element.like){
                    collposts.push({posts_,user:posts.user,liked:true})                 
                    }else
                    {
                    collposts.push({posts_,user:posts.user,liked:false})
                    }
                }
                );
            }
            }
                });
                if(ind === array.length - 1)
                {
                    collposts.sort(function(a, b) {
                        
                        var dateA = new Date(a.posts_.createat), dateB = new Date(b.posts_.createat);                                                
                        return dateB - dateA;
                    })
                    
                    res.status(200).send(collposts)
                }
            });
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/getstories',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const homestories = await StoriesHome.findOne({user:req.user._id})
        const home_arr =  homestories.Stories
        if(home_arr == [])
        {
           return  res.status(200).send('dont have posts')
        }
        var collposts =  []
         home_arr.forEach (async function(posts,ind,array){
        const stories = await Stories.findOne({user:posts.user})
        const spcei_post_arr = stories.photo
        await spcei_post_arr.forEach( async stories => {
            if(stories._id==posts.storie)
            {
                
                const oneDay = 24 * 60 * 60 * 1000;
                if( (Date.now()-new Date(posts.createat))>oneDay)
                {
                    homestories.Stories = await homestories.Stories.filter(t=>{
                        return t.storie != stories._id.toString()
                    })
                    
                }else{
                    collposts.push({stories,user:posts.user})
                }
            
            }
                });
                if(ind === array.length - 1)
                {
                    collposts.sort(function(a, b) {
                        var dateA = new Date(a.createat), dateB = new Date(b.createat);                        
                        return dateA - dateB;
                    })
                    await homestories.save()
                    res.status(200).send(collposts)
                }
            });
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.post('/remove/:id',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const mypost = await Post.findOne({user:req.user._id})      
        mypost.posts = await  mypost.posts.filter((t)=> t._id.toString() !== req.params.id)
        const home_ = await Home.findOne({user:req.user._id})
        home_.Posts = await  home_.Posts.filter((t)=> t.post  !== req.params.id)  
        res.status(200).send(mypost)
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/search/:name',MiddlewareUser, async (req, res)=> 
  {
      try
      {
          
          
          if(req.params.name == 'all')
          {
            const mypost = await user.find({}) 
            return res.status(200).send(mypost)
          }
        const name_ = req.params.name.toString()
        const mypost = await user.find({name:{"$regex": name_ }})      
        
        res.status(200).send(mypost)
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/userinfo/:user',MiddlewareUser, async (req, res)=> 
  {
      try
      {
        const user_ = await user.findById(req.params.user) 
        res.status(200).send(user_)
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/storie/:user/:storiee', async (req, res)=> 
  {
      
      try
      {
        const user_ = await Stories.findOne({user:req.params.user})
        await user_.photo.forEach(element => {
            if(element._id.toString()==req.params.storiee)
            {
                console.log(element.photo);
                
                res.set('Content-Type','image/jpg')
                return res.status(200).send(element.photo)
            }else
            {
                console.log('sadsadas');
                
            }
        });
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/following/:user',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
        const following = await Following.findOne({user:req.params.user})
        res.status(200).send(following.followers)
       
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/followers/:user',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
        const followers = await Follower.findOne({user:req.params.user})
        res.status(200).send(followers.followers)
       
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/checkfollow/:user',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
        const followers = await Follower.findOne({user:req.params.user})
        followers.followers.forEach(element => {
            if(element.follow == req.user._id.toString())
            {
                return res.status(200).send(true)
            }
        });

        res.status(200).send(followers.followers)
       
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/myfollowing',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
        const following = await Following.findOne({user:req.user._id})
        res.status(200).send(following.followers)
       
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  app.get('/myfollowers',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
        const follower = await Follower.findOne({user:req.user._id})
        res.status(200).send(follower.followers)
       
      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
  
  app.get('/postsingle/:post/:user',MiddlewareUser, async (req, res)=> 
  {
      
      try
      {
          var liked;
          var object;
        const posts_ = await Post.findOne({user:req.params.user})
        posts_.posts.forEach(element_ => {
            if(element_._id.toString()==req.params.post)
            {
                if(element_.like.length == 0)
                {
                   liked = false
                }else{
                element_.like.forEach(element => {
                    if(element.like == req.user._id.toString())
                    {
                    liked = true
                    }
                    
                });
            }
               
                object = element_
            }
        });
        return res.status(200).send({object,liked:liked})

        

      }
      catch(e)
      {
        res.status(400).send(e.message)
      }
  })
app.get('/', function (req, res) {
    res.send('Hello World')
  })
   
module.exports = app