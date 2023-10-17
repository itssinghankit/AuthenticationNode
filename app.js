require('dotenv').config();
// console.log(process.env);
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mongooseEncryption = require("mongoose-encryption")

const app = express();

mongoose.connect("mongodb://0.0.0.0/AuthDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to db"));

app.use(bodyParser.urlencoded({ extended: true }));

//////////////////////////////////user schema and model//////////////////
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(mongooseEncryption, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/register.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

////////////////////////////to save user on DB

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password
    });

    newUser.save().then(() => {
        res.sendFile(__dirname + "/userAccount.html");
    })
        .catch((err) => {
            console.log(err);
        });
});

//////////////////////////for login page

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then((foundUser) => {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.sendFile(__dirname + "/userAccount.html");
                } else {
                    res.send("wrong password");
                }
            } else {
                res.send("user not found");
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

app.listen(3000, () => {
    console.log("server started at port 3000");
});