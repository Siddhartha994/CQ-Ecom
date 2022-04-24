const express = require('express');
const bodyParser = require('body-parser')

var router = express.Router();

var Products = require('../database/models/product')

router.route('/')
.get((req,res)=>{
    if(req.session.isLoggedin){
        var perPage = 5
        var page = req.session.count
        var end = (perPage * page) - perPage
        Products.find({}).limit(end)
        .then((product) => {
            if(req.session.admin){
                res.render('home',{
                    user:req.session.user,
                    pic:req.session.pic,
                    products: product,
                    admin: true,
                    error:''
                })
            }
            else{
                res.render('home',{
                    user:req.session.user,
                    pic:req.session.pic,
                    products: product,
                    admin: '',
                    error:''
                })
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
    }
    else
        res.render('login',{error:'You are not logged in!'});  
})

router.route('/inc')
.post((req,res)=>{
    // console.log(req.body.more,req.body.collapse)
    if(req.body.more)
        req.session.count += 1
    else
        req.session.count = 2
    res.redirect(303,'/product')
})

module.exports = router;