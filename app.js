if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const Localstrategy=require("passport-local");
const User=require("./models/user.js");



const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


app.use(express.urlencoded({extended:true}));
app.set("viewengine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));




//Connection with mongodb through mongoose

const dbUrl=process.env.ATLASDB_URL;

main().then((res)=>{
    console.log("connected to DB successfully");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}

//Using Session and Flash

// creating cloud db for session info
const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

// catch error if any in mongo store
store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);
})

//setting session options
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

//using passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middle for storing variable in res.local Because we can't access req object everywhere!!
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

//using router files
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//Custom Error Handling Middleware
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something Went Wrong"}=err;
    console.log(err);
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});

// To tackle all undefined Paths
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not found!"));
});

//listening code
let port=8080;
app.listen((port),()=>{
    console.log(`Server listening to Port ${port}`);
});