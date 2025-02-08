const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

//middleware to check if user is loggedin before applying changes to anything
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in to add a new listing!!!");
        return res.redirect("/login");
    }
    next();
};

//middleware to save url to which res is to be redirected after login
module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

//Middleware to check if user is owner of the property
module.exports.isOwner =async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//Listing-Middleware to perfrom validation schema JOI
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    console.log(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }};

// Review-Middleware to perfrom validation  schema JOI
 module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
}}; 

//Middleware to check if user is owner of the review
module.exports.isReviewAuthor =async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(res.locals.currUser && !review.author.equals(res.locals.currUser._id)){
        req.flash("error","You did not create this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};



