const express = require('express');
var multer  = require('multer')

const router = express.Router();
//multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
        },
        filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
        }
}) 
const upload = multer({ storage: storage })
var Products = require('../../database/models/product')

router.route('/login')
.get((req,res)=>{
    res.render('admin/pages/addnew',{error:''});
})
.post((req,res)=>{
    res.send('working')
    //check if user is admin or not
})
router.route('/new')
.get((req,res)=>{
    res.render('admin/pages/addnew')
})
.post(upload.single('productImage'),(req,res)=>{
    if(req.session.isLoggedin){
        const file = req.file;
        req.body.image = file.filename
        req.body.seller = req.session.userid
        console.log(req.body)
        Products.create(req.body) 
        .then((product) => {
            console.log('Product Created ',product);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(product);
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
router.route('/myprod')
.get((req,res)=>{
    res.render('admin/pages/myProd')
});
router.route('/header')
.get((req,res)=>{
    res.render('admin/partials/navheader')
});

module.exports = router