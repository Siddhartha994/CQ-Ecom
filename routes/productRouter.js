var express = require('express');
var router = express.Router();

var fs  = require('fs');

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.route('/')
.get((req,res)=>{
    if(req.session.isLoggedin){
        console.log(req.session.user,req.session.pic)
        fs.readFile("products.js","utf-8",(err,data)=>{
        
        var perPage = 5
        var page = req.session.count
        var end = (perPage * page) - perPage
        
        var ndata = JSON.parse(data)
        ndata = ndata.slice(0,end);
        res.render('home',{
            user:req.session.user,
            pic:req.session.pic,
            products: ndata,
            error:''
        })
        })
    }
    else
        res.render('login',{error:'You are not logged in!'});  
})
.post((req,res)=>{
    // console.log(req.body.more,req.body.collapse)
    if(req.body.more)
        req.session.count += 1
    else
        req.session.count = 2
    res.redirect(303,'/product')
})

    module.exports = router;