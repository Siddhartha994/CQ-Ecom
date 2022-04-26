const express = require('express');
const bodyParser = require('body-parser')

var router = express.Router();
router.use(bodyParser.json());

var Carts = require('../database/models/cart')
var Products = require('../database/models/product')

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
                    if(prd.product.valueOf() == req.params.prodId){
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
        var flag = true
        var qty = req.body.quantity
        var prodId = req.params.prodId
        available(qty,req.session.userid,prodId,(newQty)=>{
            if(newQty != qty)
                flag = false
            if(flag){
                res.statusCode = 200;
                res.send({"quantity":newQty})
            }else{
                res.statusCode = 400;
                res.send('quantity not available')
            }
        });
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
.delete((req,res)=>{
    if(req.session.isLoggedin)
    {
        Carts.findOne({"userinfo":req.session.userid})
        .populate('products.product')
        .then((cart)=>{
            if(cart){
                cart.products.forEach((x,i,a)=>{
                    if(x.product._id.valueOf() == req.params.prodId){
                        var qty = req.body.quantity
                        var newQuantity = x.product.quantity + qty
                        
                        a.splice(i,1);
                        updateQuantity(newQuantity,req.session.userid,()=>{
                        });
                    }
                })
                cart.save();
                res.end();
            }
        })
    }
})
function available(qty,userId,prodId,callback){
    Carts.findOne({"userinfo":userId})
    .populate('products.product')
    .then((cart)=>{
        if(cart){
            cart.products.forEach((x)=>{
                if(x.product._id.valueOf() == prodId){
                    var res = Math.min(x.product.quantity,qty);
                    var newQuantity = x.product.quantity - res
                    x.quantity = res
                    callback(res);
                    updateQuantity(newQuantity,prodId)
                }
            })
            cart.save();
        }
    })
}
function updateQuantity(qty,userId,cb){
    Products.findByIdAndUpdate({"_id": userId},{"quantity":qty},()=>{
        cb();
    });
}
module.exports = router;