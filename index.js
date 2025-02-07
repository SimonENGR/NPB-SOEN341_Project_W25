const express = require('express')
const cors = require('cors')

require('dotenv').config()
const connectDB = require('./config/connectDb')
const router = require('./routes/index')

const app = express()
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))

app.use(express.json())

//Server will run as 3000
const PORT = process.env.PORT || 3000

//API for testing purpose
app.get('/',(request,response)=>{
    response.json({
        message : "Server running at " + PORT
    })
})

//API endpoints
app.use('/api',router)



//Also installed one dependency that in case nay changes is made to 
//current file, Server will run again
// Dependency : npm i nodemon

//Connectiog Database here
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Our server is runnung at " + PORT)
    })
})
