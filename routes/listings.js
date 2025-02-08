const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingContoller=require("../controllers/listings.js");

const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage:storage });

//index route,create routes
router.route("/")
    .get(wrapAsync(listingContoller.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingContoller.createListing));

//new form route
router.get("/new",isLoggedIn,listingContoller.renderNewForm);

//show,update,delete routes
router.route("/:id")
    .get(wrapAsync(listingContoller.showListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingContoller.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingContoller.deleteListing));

//Edit form Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingContoller.renderEditForm));

module.exports=router;