const mongoose = require('mongoose')
module.exports.enum  = {
    admin: 1,
    customer: 2
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic:{ type: String, required: true},
    userType:{ type: Number,required: true,default:2 },
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{
    timestamps: true
});
const userModel = mongoose.model('luser',userSchema)
module.exports.role = userModel;