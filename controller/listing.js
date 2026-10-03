const Listing = require("../models/listing.js");

module.exports.index =  async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
};

// Show listings filtered by category
module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;
    const listings = await Listing.find({ category: category });
    if(listings.length === 0){
        req.flash("error","no listings exists for this category")
        return res.redirect("/listings"); 
    }
    res.render("listings/index.ejs", { allListings: listings });
};

module.exports.filterRoute = async (req, res) => {
    try {
        const searchText = req.query.query?.trim() || "";
        let allListings = [];

        if (!searchText) {
            allListings = await Listing.find({});
            // req.flash("success", "Showing all listings");
            return res.redirect("/listings"); 
        }

        const searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        // Search across multiple fields
        allListings = await Listing.find({
        $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
            ],
        });

        // Handle results
        if (allListings.length === 0) {
            req.flash("error", `No listings found for “${searchText}”`);
            return res.redirect("/listings"); // flash msg visible, avoids rendering empty page
        }

        // console.log(searchText);
        
        // req.flash("success", `Results for “${searchText}”`);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Search error:", err);
        req.flash("error", "Something went wrong while searching.");
        return res.redirect("/listings");
    }
};


module.exports.renderNewForm = async(req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews",populate : {path: "author"}}).populate("owner");
    // console.log(listing);
    if(!listing){//for flash msg
        req.flash("error","listing you requested for does not exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req,res,next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    let newListing = new Listing(req.body.listing);
    // console.log(req.user);
    
    newListing.owner = req.user._id;
    newListing.image = {filename , url};
    console.log(newListing);
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){//for error flash msg
        req.flash("error","listing you requested for does not exists!");
        return res.redirect("/listings");   
    }
    // req.flash("success","listing edit successfully");
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    //  console.log(listing);
    //  console.log("reqfile")
    //  console.log(req.file)

    if(req.file) {//if(typeof req.file !== "undefined")
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);  
    console.log(deleteListing);
    req.flash("success","listing deleted");
    res.redirect("/listings");
};

module.exports.Privacy = (req,res)=>{
    res.render("./listings/privacy.ejs");
};
module.exports.TermsConditions = (req,res)=>{
    res.render("./listings/terms.ejs");
}
