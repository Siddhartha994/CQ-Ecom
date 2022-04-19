const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// require('mongoose-currency').loadType(mongoose);   
// const Currency = mongoose.Types.Currency;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'luser'
    },
    quantity:{
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

var Products = mongoose.model('Products',productSchema);

module.exports = Products;