const UserModel = require("../models/UserModel")
const bcryptjs = require('bcryptjs')

async function registerUser(){
    try{
        const { name, email , password, profile_pic} = request.body

        //Check if email already used
        const checkEmail = await UserModel.findOne({email})

        if(checkEmail){
            return response.status(400).json({
                message : "User already exists, try another email.",
                error:true
            
            })
        }

        //password encrypton
        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password, salt)

        //for formating
        const payload = {
            name,
            email,
            profile_pic,
            password : hashpassword
        }

        const user = new UserModel(payload)

        //save details to database
        const userSave = await user.save()

        //Confirmation of new user creation
        return response.status(201).json({
            message : "Account created !!",
            data : userSave,
            success : true
        })


    } catch(error){
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

module.exports = registerUser