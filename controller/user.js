const User = require("../models/user");

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req,res,next) => {
    try{
        let {username, email, password} = req.body;
        let newUser = new User({username , email});
        const registerUser = await User.register(newUser , password);
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) { 
                return next(err); 
            } 
            req.flash("success","Welcome To WanderLust");
            res.redirect("/listings");
        });
    } catch(err) {
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req,res) => {
    req.flash("success","Back To WanderLust");
    let redirectLink;
    if(res.locals.redirectUrl){
        redirectLink = res.locals.redirectUrl;
    }else{
        redirectLink = "/listings";
    }
    res.redirect(redirectLink);

    // res.redirect(req.session.redirectUrl);//isko passport reset krba dega
    // res.redirect("/listings");//sbse phle tha
}

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success","you logged out!");
        res.redirect("/listings");
    })
}
