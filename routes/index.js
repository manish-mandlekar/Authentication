var express = require('express');
var router = express.Router();
var userModel = require('./users')
const passport = require("passport");
const localStrategy = require('passport-local');
const postModel = require('./post')
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/edit/:id',isLoggedIn ,function(req, res, next) {
  userModel.findOne({
    _id : req.params.id
  }).then((user)=>{
    
      //  console.log(user);
      res.render('edit',{user});
    
  })
});
router.get('/check/:username', function(req, res, next) {
 userModel.findOne({
  username : req.params.username
 }).then((user)=>{
  console.log(user);
  if(user){
    res.json(true)
  } else {
      res.json(false)
    }
  })
  
 })
 router.post('/updated',isLoggedIn ,function(req, res, next) {
  userModel.findOneAndUpdate({
    username : req.session.passport.user
  },{
    username : req.body.username
  } , {new : true}).then((updated)=>{
    req.login(updated , function(err){
      if(err){ return next(err)}
      return res.redirect("/profile")
    })
  })
  
});

router.post('/uploadpic',upload.single('file') ,function(req, res, next) {
  userModel.findOneAndUpdate({
    username : req.session.passport.user
  },{
    img : req.file.filename
  }).then((user)=>{
   res.redirect("/profile")
  })
});


router.get('/feed', isLoggedIn ,  function(req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then((user) => {
    // user.findOne().populate("user").then(() => {
      // console.log(user);
       postModel.find().populate("user").then((allpost)=>{

        
         res.render('file', { user, allpost});
       })
    })
  })
// })
router.get('/singup', function(req, res, next) {
  res.render('singup', { title: 'Express' });
});
router.post('/postcomment', function(req, res, next) {
  userModel.findOne({username: req.session.passport.user}).then((founduser)=>{
    
    postModel.create({
      post : req.body.post,
      user:founduser._id
    }).then((postcreated)=>{
      founduser.posts.push(postcreated._id)
      founduser.save().then(()=>{

        res.redirect('/profile');
      })
    })
  });
  })

router.get('/dltcmnt/:id', function(req, res, next) {
  postModel.findByIdAndDelete({
   _id:req.params.id
  }).then((dltpost)=>{
    res.redirect('/profile');

  })
});
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user

  }).populate("posts").then((user) => {
    postModel.find().populate("user").then((tolo)=>{
      // console.log(user ," ha ha ha " , tolo);
      res.render('profile', { user, posts:user.posts , tolo});
    })
    })
    // user.find().populate("user").then(() => {
      // res.send(user)
      
  
  })
// })
router.post('/register', function (req, res) {
  userModel.findOne({username : req.body.username}).then((founduser)=>{
    if(founduser){
  res.send("username already exist!!")
    } else {
      var newUser = new userModel({
        username : req.body.username,
        age: req.body.age,
        email : req.body.email,
        contact : req.body.contact
      })
      userModel.register(newUser, req.body.password)
      .then(function (u) {
        passport.authenticate('local')(req, res, function () {
          res.redirect('/profile');
        })
      })
    }
  })
  
});
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "profile",
    failureRedirect: "/",
  }),
  function (req, res, next) {}
);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}
router.get('/likes/:id', function (req, res, next) {
  postModel.findOne({
    _id: req.params.id 
  }).then((foundPost)=>{
    // console.log("sdfghjkl ",req.user.id);
    if(foundPost.likes.includes(req.user.id)){
      var index = foundPost.likes.indexOf(req.user.id);
    foundPost.likes.splice(index, 1);
    }else{

      foundPost.likes.push(req.user.id)
    }
  foundPost.save().then(()=>{

    res.redirect('back');
  })
  })
});
module.exports = router;
