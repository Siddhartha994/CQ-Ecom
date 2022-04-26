const express = require('express');
const bodyParser = require('body-parser')

var router = express.Router();
router.use(bodyParser.json());

var Carts = require('../database/models/cart')

router.route('/')
.get((req,res)=>{
    if(req.session.isLoggedin){
        Carts.findOne({"userinfo": req.session.userid})
        .populate('userinfo')
        .populate('products.product')
        .then((cart) => {
            if(cart){
                res.render('cart',{items:cart.products,error:''})
            }else{
                res.render('cart',{items:'',error:'No items in your cart'})
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
    }
    else
        res.render('login',{error:'You are not logged in!'});  
})
router.route('/:prodId')
.get((req,res)=>{
    if(req.session.isLoggedin){
        Carts.findOne({"userinfo": req.session.userid})
        .then((cart) => {
            if(cart){
                cart.products.forEach((prd)=>{
                    console.log('in'+prd.product.valueOf(),req.params.prodId)
                    if(prd.product.valueOf() == req.params.prodId){
                        console.log('in')
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(prd);
                    }
                })
            }else{
                res.end('No items in your cart');
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
    }
    else
        res.end('You are not logged in !');
})
.post((req,res)=>{
    if(req.session.isLoggedin){
        Carts.findOne({"userinfo": req.session.userid})
        .then((cart) => {
            if(cart) {
                var flag = true
                cart.products.forEach( (x) => {
                    if(x.product.valueOf() == req.params.prodId)
                        flag = false
                })
                if(flag){
                    var x = {"product":req.params.prodId,"quantity":1}
                    cart.products.push(x);
                    cart.save()
                    res.statusCode = 201;
                    res.end();
                }else{
                    res.statusCode = 200;
                    res.end();
                }
            }
            else {
                var cart = {
                    products:[{
                        "product": req.params.prodId,
                        "quantity": 1
                    }],
                    "userinfo":req.session.userid
                }
                Carts.create(cart)
                .then(() => {
                    res.statusCode = 201;
                    res.end();
                }, (err) => console.log(err));
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err))
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
.put((req,res)=>{
    if(req.session.isLoggedin){
        var qty = req.body.quantity
        console.log(qty)
        Carts.findOne({"userinfo": req.session.userid})
        .then((cart) => {
            if(cart) {
                cart.products.forEach( (x) => {
                    if(x.product.valueOf() == req.params.prodId){
                        x.quantity = qty
                    }
                })
                cart.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end();
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err))
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
module.exports = router;