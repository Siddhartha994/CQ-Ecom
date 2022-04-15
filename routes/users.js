var express = require('express');
const bodyParser = require('body-parser');

var Users = require('../database/models/user');

var router = express.Router();
router.use(bodyParser.json());
// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/',(req,res)=>{
  res.render('home') 
})

router.route('/signup')
.get((req,res)=>{
  res.render('signup',{error:''});
})
.post(upload.single('profilePic'),(req,res)=>{
  const username = req.body.username;
  const password = req.body.password; 
  const email = req.body.email; 

  const file = req.file; 
  // console.log(username,password,req.file)
  if(!username){
      res.render('signup',{error:"Enter Username"});
      return
  }
  if(!password){
      res.render('signup',{error:"Enter Password"});
      return
  }
  if(!file){
      res.render('signup',{error:"Upload profile pic"});
      return
  }

  Users.findOne({username: username})
.then((user) => {
      if(user != null) {
          res.render('signup',{error: 'User already exists!'});
          return
      }
      else {
          Users.create({
              username: username,
              password: password,
              profilePic: file.filename,
              email: email
          })
          .then(()=>{ //nodemon fucking with 307(prolly erasing req)
              // console.log(username,password)
              res.redirect(307,'/login')  //307(temp-redirect)=>Method and body not changed
          })                             //303=> GET methods unchanged. Others changed to GET (body lost).
          .catch((error)=>{
          })
      }
})
})

router.route('/login')
.get((req,res)=>{
  res.render('login',{error:''});
})
.post((req,res)=>{
  var username = req.body.username
  var password = req.body.password
  if(!req.session.isLoggedin) {
      console.log(username,password)
      Users.findOne({username: username})
      .then((user) => {
          if (user === null) 
              res.render('login',{error:'User  does not exist!'});
              
          else if (user.password !== password) 
              res.render('login',{error:'Your password is incorrect!'});
          else if (user.username === username && user.password === password) {
              req.session.user = username
              req.session.pic = user.profilePic
              req.session.isLoggedin = true
              req.session.count = 2;
              res.redirect('/welcome')
          }
      })
      .catch((err) => console.log(err));
  }
  else{
      // req.session.user = username
      // req.session.pic = user.profilePic
      req.session.count = 2;
      res.redirect('/welcome')
  } 
})

router.get("/logout",(req,res)=>{
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  }
})
module.exports = router;
