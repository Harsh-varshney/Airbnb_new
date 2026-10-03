if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

// let dbUrl = process.env.ATLASDB_URL;
let dbUrl = "mongodb://127.0.0.1:27017/project";

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"public"))); 
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);

main().then(() => {
    console.log("connect successfully");
}).catch(err => console.log(err));


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/project");
    // await mongoose.connect(dbUrl);
}

let port = process.env.PORT || 8080;
app.listen(port,() => {
    console.log(`server listen at port : ${port}`);
});

// mongo store
const store = MongoStore.create({
    mongoUrl : dbUrl,
    ttl: 7 * 24 * 60 * 60, 
    // crypto: {
    //     secret: 'mysupersecretcode'
    // },
    // touchAfter : 24 * 3600
})

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE",err);
})

// for session
const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

app.use(session(sessionOptions));
app.use(flash());


// for authentication
app.use(passport.initialize());//mw for init pwd
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    //  console.log("CURRENT USER:", req.user);
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser= req.user;
    next();
});


app.get("/", (req, res) => {
    res.redirect("/listings");
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// Errors handle
app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page not found!"));
});

app.use((err,req,res,next) => {
    let {statusCode = 500,message = "Something Went Wrong!"} = err;
    // res.render("error.ejs",{message});
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})


// for register user
// app.get("/demouser",async (req,res) => {
//     let fakeUser = new User({
//         email : "Student@gmail.com",
//         username : "delta-student"
//     }); 
//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
// });


