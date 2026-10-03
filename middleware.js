const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
    // console.log(req.user)
    // console.log(req.path , " ----- " ,req.originalUrl);
    if(!req.isAuthenticated()){
        // console.log(req);
        // console.log(req.path , " ----- " ,req.originalUrl);
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in first!");
        return res.redirect("/login");
    }
    next();
}; 

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// for authorization
module.exports.isOwner = async (req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsgs = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsgs);
    }else{
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        console.log(error);
        let errMsgs = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsgs);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next) => {
    let { id, reviewId} = req.params;
    let review= await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the Author of the review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
