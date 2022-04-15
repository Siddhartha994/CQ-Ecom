module.exports.init = ()=>{
    const mongoose = require('mongoose');
    mongoose.connect('mongodb+srv://sira:1234@cluster0.dj1ls.mongodb.net/ecommmerce?retryWrites=true&w=majority')
    .then(()=>{
        console.log('db is live')
    })
    .catch(()=>{
        console.log('Error in db connection')
    })
}