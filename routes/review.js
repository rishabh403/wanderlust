const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,validateReview,isReviewAuthor}=require("../middleware.js");
const reviewContoller=require("../controllers/reviews.js");


//Review Post Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewContoller.createReview));

//Review delete route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewContoller.deleteReview));

module.exports=router;