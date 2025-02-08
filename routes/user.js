const express=require("express");
const router=express.Router();

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveredirectUrl}=require("../middleware.js");
const userContoller=require("../controllers/users.js");

//signup form,signup user routes
router.route("/signup")
    .get(userContoller.renderSignupForm)
    .post(wrapAsync(userContoller.signupUser));

//login form,login user routes
router.route("/login")
    .get(userContoller.renderLoginForm)
    .post(saveredirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userContoller.loginUser);

//logout route
router.get("/logout",userContoller.logoutUser);

module.exports=router;
