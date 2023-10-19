require('dotenv').config();
// console.log(process.env);
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const mongooseEncryption = require("mongoose-encryption");

// const md5=require("md5");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy
const session = require("express-session");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

/////////////// the express session code is needed to be defined below uses and above mongoose connections

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0/AuthDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to db"));
// mongoose.set("useCreateIndex",true);


//////////////////////////////////////////////////////////// user schema and model

// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String
// });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,

});

// userSchema.plugin(mongooseEncryption, { secret: process.env.SECRET, encryptedFields: ["password"] });
// userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

////////////////////////////////////////////should be below model

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(

    function (username, password, done) {
        console.log("username");
        console.log(password);
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (user.password!== password) { return done(null, false); }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/register.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.get("/userAccount", (req, res) => {
    // if (req.isAuthenticated()) {
    res.sendFile(__dirname + "/userAccount.html");
    // } else {
    //     res.redirect("/login");
    // }

});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

////////////////////////////////////////////////////////to save user on DB

// app.post("/register", (req, res) => {

//     ////////////////////////////////////////////////////by using bcrypt and salting

//     bcrypt.hash(req.body.password, saltRounds, function (err, hash) {

//         const newUser = new User({
//             email: req.body.email,
//             password: hash
//         });

//         newUser.save().then(() => {
//             res.sendFile(__dirname + "/userAccount.html");
//         })
//             .catch((err) => {
//                 console.log(err);
//             });

//     });

//     ////////////////////////////////////////////////////conventional md5 encryption

//     // const newUser = new User({
//     //     email: req.body.email,
//     //     password: md5(req.body.password)
//     // });

//     // newUser.save().then(() => {
//     //     res.sendFile(__dirname + "/userAccount.html");
//     // })
//     //     .catch((err) => {
//     //         console.log(err);
//     //     });

// });

//////////////////////////////////////////////////////////for login page

// app.post("/login", (req, res) => {
//     const email = req.body.email;
//     // const password = md5(req.body.password);
//     const password = req.body.password;

//     User.findOne({ email: email })
//         .then((foundUser) => {
//             if (foundUser) {
//                 //////////////////////////////////////////using bcrypt

//                 bcrypt.compare(password, foundUser.password, function (err, result) {

//                     if (result === true) {
//                         res.sendFile(__dirname + "/userAccount.html");
//                     } else {
//                         res.send("wrong password!");
//                     }


//                 });

//                 //////////////////////////////////////using previous methods of MD5 and mongoose encryption

//                 // if (foundUser.password === password) {
//                 //     res.sendFile(__dirname + "/userAccount.html");
//                 // } else {
//                 //     res.send("wrong password");
//                 // }
//             } else {
//                 res.send("user not found");
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// });

/////////////////////////////////////////////////by using express session and passport local mongoose

app.post("/login", passport.authenticate("local", {
    successRedirect: "/userAccount",
    failureRedirect: "/login"
}));

app.post("/register", (req, res) => {

    const newUser = new User({ username: req.body.email, password: req.body.password });

    newUser.save().then(() => {
        res.redirect("/userAccount");
    }).catch((err) => {
        console.log(err);
    })

    // app.post("/register", (req, res) => {

    //     User.register({ username: req.body.email }, req.body.password, (err, user) => {
    //         if (err) {
    //             console.log(err);
    //             console.log("hello");
    //             res.redirect("/");
    //         } else {
    //             console.log("meow");
    //             // passport.authenticate("localStra")(req, res, () => {
    //             //     console.log("ok");
    //             //     res.redirect("/userAccount");
    //             // });
    //             //             pp.post('/login/password',
    //             //   passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
    //             //   function(req, res) {
    //             //     res.redirect('/~' + req.user.username);
    //             //   });
    //         }
    //     })
});

app.listen(3000, () => {
    console.log("server started at port 3000");
});