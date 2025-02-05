const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

//looks for html pages in views directory(folder)
app.use(express.static("views"));
const Users = [];
app.post("/register", (req, res) => {
    // Access the form data sent by the user
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    Users.push({ name, email, password: hash });//to replace with Database
    console.log("Received registration data:");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Number of accounts = ${Users.length}`)

    res.sendFile(path.join(__dirname, "views", "LOGINPAGE.html"));
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "LOGINPAGE.html"));
})
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "REGISTERPAGE.html"));
})
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = Users.find(u=>u.name===username);//replace with Database check for username
    if (!user) {
        return res.status(400).send("Username is required");
    }
    const userPassword = await bcrypt.compare(password, user.password); //to replace maybe
    if (userPassword) {//password is correct
        res.redirect("/HOMEPAGE.html");//to redirect to homepage
    }else{
        res.redirect("/LOGINPAGE.html");//to redirect to login page
    }
})
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname,"views","LOGINPAGE.html"));
})
app.get("/home_page", (req, res) => {
    res.sendFile(path.join(__dirname,"views","HOMEPAGE.html"));
})


app.listen(3000,()=>console.log("Server is on port 3000"));