const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());//to parse json requests
app.use(cors({
    origin: "http://localhost:3000", // The URL of your React app
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true // Allow cookies to be sent with requests (if needed)
}));

const Users = [];


app.post("/register", (req, res) => {
    // Access the form data sent by the user
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    Users.push({ name, email, password: hash });//<---to replace with Database
    console.log("Received registration data:");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Number of accounts = ${Users.length}`)

    res.status(201).json({ message: "Registration successful" });
});
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "views", "LOGINPAGE.html"));
// })
// app.get("/register", (req, res) => {
//     res.sendFile(path.join(__dirname, "views", "REGISTERPAGE.html"));
// })
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = Users.find(u=>u.name===username);//replace with Database check for username
    if (!user) {
        return res.status(400).send("Username is required");
    }
    const userPassword = await bcrypt.compare(password, user.password); //to replace maybe
    if (userPassword) {//password is correct
        //res.redirect("/HOMEPAGE.html");//to redirect to homepage

        return res.status(200).json({ message: "login successful" });
    }else{
        //res.redirect("/LOGINPAGE.html");//to redirect to login page
        return res.status(400).json({ message: "Invalid password" });
    }
})
// app.get("/login", (req, res) => {
//     res.sendFile(path.join(__dirname,"views","LOGINPAGE.html"));
// })
app.get("/home_page", (req, res) => {
    //res.sendFile(path.join(__dirname,"views","HOMEPAGE.html"));
    res.json({ message: "Welcome to the homepage!" });
})


app.listen(5000,()=>console.log("Server is on port 5000"));
