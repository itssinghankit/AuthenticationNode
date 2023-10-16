const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

mongoose.connect("mongodb://0.0.0.0/AuthDB", { useNewUrlParser: true,
useUnifiedTopology: true,
}).then(() => console.log("Connected to db"));


app.use(bodyParser.urlencoded({ extended: true }));

//////////////////////////////////user schema and model//////////////////
const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html");
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname+"/register.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname+"/login.html");
});

app.listen(3000, () => {
    console.log("server started at port 3000");
});