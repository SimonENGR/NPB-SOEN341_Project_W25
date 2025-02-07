const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        requires : [true, "name required"]
    },
    email : {
        type : String,
        required : [true,"email required"],
        unique : true //so that no one reuse already used mail
    },
    password : {
        type : String,
        required : [true, "password required"]
    },
    profile_pic : {
        type : String,
        default : ""
    }
},{
    timestamps : true 
})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel