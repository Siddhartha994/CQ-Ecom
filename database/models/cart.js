const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incartProduct = new Schema({
    product:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Products',
    },
    quantity:{
        type: Number,
        required: true
    }
});
const cartSchema = new Schema({
    products: [incartProduct],
    userinfo: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'luser',
        unique : true
    }
});
var Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;