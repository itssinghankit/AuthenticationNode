require('dotenv').config();
// console.log(process.env);
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const mongooseEncryption = require("mongoose-encryption")
// const md5=require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://0.0.0.0/AuthDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to db"));

app.use(bodyParser.urlencoded({ extended: true }));

//////////////////////////////////////////////////////////// user schema and model

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(mongooseEncryption, { secret: process.env.SECRET, encryptedFields: ["password"] });

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

////////////////////////////////////////////////////////to save user on DB

app.post("/register", (req, res) => {

    ////////////////////////////////////////////////////by using bcrypt and salting

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {

        const newUser = new User({
            email: req.body.email,
            password: hash
        });

        newUser.save().then(() => {
            res.sendFile(__dirname + "/userAccount.html");
        })
            .catch((err) => {
                console.log(err);
            });

    });

    ////////////////////////////////////////////////////conventional md5 encryption

    // const newUser = new User({
    //     email: req.body.email,
    //     password: md5(req.body.password)
    // });

    // newUser.save().then(() => {
    //     res.sendFile(__dirname + "/userAccount.html");
    // })
    //     .catch((err) => {
    //         console.log(err);
    //     });

});

//////////////////////////////////////////////////////////for login page

app.post("/login", (req, res) => {
    const email = req.body.email;
    // const password = md5(req.body.password);
    const password = req.body.password;

    User.findOne({ email: email })
        .then((foundUser) => {
            if (foundUser) {
                //////////////////////////////////////////using bcrypt

                bcrypt.compare(password, foundUser.password, function (err, result) {

                    if (result === true) {
                        res.sendFile(__dirname + "/userAccount.html");
                    } else {
                        res.send("wrong password!");
                    }


                });

                //////////////////////////////////////using previous methods of MD5 and mongoose encryption

                // if (foundUser.password === password) {
                //     res.sendFile(__dirname + "/userAccount.html");
                // } else {
                //     res.send("wrong password");
                // }
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