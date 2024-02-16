var express = require('express');
const userModel=require("./users");
const postModel=require("./posts")
const passport = require('passport');
const { route } = require('../app');
const upload=require('./multer')
const localStrategy=require("passport-local").Strategy
var router = express.Router();
passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("register");
});
router.get("/login",function(req,res){
  res.render("login")
})
router.post("/register",function(req,res){
  const {username,name,email}=req.body
  const userData=new userModel({
    username,
    name,
    email
  })
  userModel.register(userData,req.body.password,function(err,registeredUser){
    if(err){   
       res.redirect("/")
      }
      passport.authenticate("local")(req,res,function(){
        res.redirect("/profile")
      })
  })
})



router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login"
}))

router.get("/logout",function(req,res,next){
req.logout(function(err){
  if(err) return next(err)
  res.redirect("/")
})
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/login")
}
router.get("/profile",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts")
console.log(user.profileImage)
  res.render("profile",{user})
})
router.get("/addpost",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render("addpost",{user})
})
router.get("/feed",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  const posts=await postModel.find().populate("user")
  res.render("feed",{posts,user})
})
router.get("/search",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render("search",{user})
})
router.get("/editprofile",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render("editprofile",{user})
})
router.post("/updateDetails",isLoggedIn,upload.single("image"), async function(req,res){
  const user=await userModel.findOneAndUpdate({username:req.session.passport.user},{name:req.body.name,username:req.body.username,bio:req.body.bio},{new:true})
  if(req.file){
    user.profileImage=req.file.filename
  }
  await user.save()
  res.redirect("/profile")
})
router.post("/addpost",isLoggedIn,upload.single("post"),async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.create({
    image:req.file.filename,
    caption:req.body.caption,
    user:user._id
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/feed")
})

router.get("/post/like/:postId",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.findOne({_id:req.params.postId})
  if(post.likes.indexOf(user._id)===-1){
    post.likes.push(user._id)
  }else{
    post.likes.splice(post.likes.indexOf(user._id),1)
  }
  await post.save()
  res.redirect("/feed")
 
})

router.get("/username/:username",async function(req,res){
  const regex= new RegExp(`^${req.params.username}`,'i')//making it case insensitive
  const users=await userModel.find({username:regex})
  res.json(users)
})
module.exports = router;
