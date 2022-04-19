router.route('/:prodId')
.post((req,res)=>{
    if(req.session.isLoggedin){
        Carts.findOne({"userinfo": req.session.userid})
        .then((cart) => {
            if(cart) {
                var flag = false
                
                check(cart,flag,(flag,cart)=>{
                    console.log('done2')
                    console.log(flag)
                    if(flag){
                        var x = {"product":req.params.prodId,"quantity":1}
                        cart.products.push(x);
                        console.log('done3')
                    }
                    cart.save()
                    .then((cart) => {
                        console.log(cart)
                        Carts.findById(cart._id)
                        .populate('userinfo')
                        .populate('products')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    }, (err) => console.log(err));
                })
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
                .then((cart) => {
                    console.log('Added to cart',cart);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cart);
                }, (err) => console.log(err));
            }
        }, (err) => console.log(err))
        .catch((err) => console.log(err))
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
function check(cart,flag,callback){
    cart.products.forEach((x) => {
        console.log(x.product.valueOf())
        if(x.product.valueOf() == req.params._id)
            flag = true
    })
    console.log('done1')
    callback(flag,cart);
}