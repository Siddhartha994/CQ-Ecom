const mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic:{ type: String, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{
    timestamps: true
});
const userModel = mongoose.model('luser',userSchema)
module.exports = userModel;