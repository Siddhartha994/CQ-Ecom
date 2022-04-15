var express = require('express');
var multer  = require('multer')
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var async = require('async');
var crypto = require('crypto');
var bodyParser = require('body-parser');

var Users = require('../database/models/user');

//multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
        },
        filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
        }
}) 
const upload = multer({ storage: storage })

var router = express.Router();

// router.use(bodyParser.json());
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
    const confirmP = req.body.confirmPassword;
console.log(password,confirmP,req.body)
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
    if(password !== confirmP){
        res.render('signup',{error:"Passwords do not match"});
        return
    }
    if(!file){
        res.render('signup',{error:"Upload profile pic"});
        return
    }
    Users.findOne({email: email})
    .then((user)=>{
        if(user != null)
            res.render('signup',{error:'Email already in use'})
            return
    })
    .catch(error=>console.log(error))

    Users.findOne({username: username})
    .then((user) => {
        if(user != null) {
            res.render('signup',{error: 'username not available!'});
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
            res.redirect('/')  //307(temp-redirect)=>Method and body not changed
        })                             //303=> GET methods unchanged. Others changed to GET (body lost).
        .catch((error)=>{
            console.log(error)
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
        Users.findOne({ username: username })
        .then((user) => {
            if (user === null) 
                res.render('login',{error:'User  does not exist!'});
                
            else if (user.password !== password) 
                res.render('login',{error:'Your password is incorrect!'});
            else if (user.username === username && user.password === password) {
                console.log(user)
                req.session.user = username
                req.session.pic = user.profilePic
                req.session.email = user.email
                req.session.isLoggedin = true
                req.session.count = 2;
                res.redirect(303,'/product')
            }
        })
        .catch((err) => console.log(err));
    }
    else{
        // req.session.user = username
        // req.session.pic = user.profilePic
        req.session.count = 2;
        res.redirect(303,'/product')
    } 
})


router.get("/logout",(req,res)=>{
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
})

//forgot?
//reset


router.route('/reset')
.post((req, res, next)=> {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
            });
        },
        function(token, done) {
            var email 
            req.session.isLoggedin?email =  req.session.email : email = req.body.email
            Users.findOne({email: email})
            .then((user)=>{
                if (!user) {
                    res.render('forgot',{user:'',sent:'',error:'Email not registered,try again!!'});
                }    
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                done(err, token, user);
                return
                })
            })
            .catch(error=>console.log(error));
        },
        function(token, user, done) {
            var transporter = nodemailer.createTransport({
                service: "yahoo",
                auth: {
                    user: "rana.siddharth994@yahoo.com",
                    pass: "bsqnzdltpnsxaxec"
                }
            });
            // console.log(user.email)
            var mailOptions = {
            from: 'rana.siddharth994@yahoo.com',
            to: user.email,
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                res.render('forgot', {user:req.session.user , sent:'true',error:''});
                done(err, 'done');
            });
        }
        ], function(err) {
        if (err) return next(err);
            console.log(err)
        });
});
router.route('/reset/:token')
.get((req, res)=>{
    Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            console.log('failed')
        // req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.session.user,
            sent: '',
            error:''
        });
    });
})
.post((req, res)=> {
    async.waterfall([
        function(done) {
        Users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
            }
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.save(function(err) {
            req.logIn(user, function(err) {
                done(err, user);
            });
            });
        });
        },
        function(user, done) {
        var smtpTransport = nodemailer.createTransport('SMTP', {
            service: 'SendGrid',
            auth: {
            user: 'sira.dev22@gmail.com',
            pass: 'gmail1405'
            }
        });
        var mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
        });
        }
    ], function(err) {
        res.redirect('/');
    });
});

router.route('/forgot') 
.get((req, res)=>{
    if(req.session){
        res.render('forgot', {
            user: req.session.user,
            sent:'',
            error:''
        });
    }
    else{
        res.render('forgot',{
            user: '',
            sent:'',
            error:''
        });
    }
});

module.exports = router;
