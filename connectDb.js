//This is responsible for connection 
//to MongoDB database

 const mongoose = require('mongoose')

 //function to connect with mongoDB database
async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)

        //Confirmation about connection to database
        const connection = mongoose.connection

        connection.on('connected',()=>{
            console.log("Connection to MongoDB was successful :)")
        })

        //For error while conection to database
        connection.on('error',(error)=>{
            console.log("Connection to MongoDB was not successful :( ",error)
        })

    }catch(error){
        console.log("Got error while connecting to Database. ",error)
    }
}

module.exports = connectDb