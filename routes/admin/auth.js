const express = require('express');
var multer  = require('multer')

const bodyParser = require('body-parser')
const router = express.Router();
router.use(bodyParser.json());
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
    console.log(req.body)
    if(req.session.isLoggedin){
        const file = req.file;
        req.body.image = file.filename
        req.body.seller = req.session.userid
        Products.create(req.body) 
        .then((product) => {
            console.log('Product Created ',product);
            res.redirect('myprod')
        }, (err) => console.log(err))
        .catch((err) => console.log(err));
    }
    else    
        res.render('login',{error:'You are not logged in !'});
})
router.route('/myprod')
.get((req,res)=>{
    var arr = []
    Products.find({"seller": req.session.userid})
    .then((myprod)=>{
        res.render('admin/pages/myProd',{prod: myprod})
    })
})
.post((req,res)=>{
    console.log(req.body.id)
    Products.findByIdAndUpdate(req.body.id,{
        $set:req.body
    }).then(()=>{
        res.redirect('myprod');
    })
});
router.route('/:id')
.delete((req,res)=>{
    console.log('req received'+ req.params.id)
    Products.findByIdAndRemove(req.params.id, function(err) {
        if (err) { console.log(err)}
        else res.end()
    });
})
//findByIdAndDelete ==> deleting first element from db


// })
module.exports = router