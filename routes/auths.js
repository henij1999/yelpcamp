var express = require("express");
var router  = express.Router();
var passport       =   require("passport");
var User     = require("../models/users");
var campground  = require("../models/campgrounds");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dppdct5dp', 
  api_key: "293253765681581", 
  api_secret: "deIreYeLNj4y8TATA_yXbh-dBkc"
});

//to register
router.get("/register",function(req, res) {
    res.render("register");
});
//to save the new user in the databse
router.post("/register",upload.single('image'),function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        var newUser = new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        avatar:result.secure_url,
        email:req.body.email,
        username:req.body.username
    });
    if(req.body.admincode == "HenilIsTheBestInTheWorld!@#"){
        newUser.isAdmin = true;
    }
    console.log(newUser);
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Welcome to YelpCamp "+ user.username);
                res.redirect("/campgrounds");
            });
        }
    });
    })
});


////Login page
router.get("/login",function(req, res) {
    res.render("login");
});


//to handle login logic
router.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}),function(req, res) {
});

//================
//User Profile
//================
router.get("/user/:id",function(req, res) {
    User.findById(req.params.id,function(err,user) {
        if(err){
            req.flash("error","something went wrong");
            res.redirect("/campgrounds")
        }else{
            campground.find({"author.id":req.params.id},function(err,foundCamp) {
                if(err){
                    res.redirect("/campgrounds")
                }else{
                    res.render("showUser2",{user:user,campgrounds:foundCamp});
                }
            })
        }
    })
})

//to Logout
router.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","Successfully Logged out")
    res.redirect("/campgrounds");
});

//middleware function
//To check wether a user is logged in or not
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("error","Please login first")
        res.redirect("/login");
    }
}


module.exports=router;