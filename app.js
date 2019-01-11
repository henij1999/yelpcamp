var express        =   require("express");
var app            =   express();
var bodyParser     =   require("body-parser");
var mongoose       =   require("mongoose");
var passport       =   require("passport");
var passportLocal  =   require("passport-local");
var expressSession =   require("express-session");
var flash          =   require("connect-flash");
var methodOverride =   require("method-override");
//var seedDB       =   require("./seeds");
var User           =   require("./models/users");
var campground     =   require("./models/campgrounds");
var Comment        =   require("./models/comments");

//requiring routes
var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes    = require("./routes/comments");
var authRoutes       = require("./routes/auths");

//Starting Up
mongoose.connect("mongodb://localhost/yelpcamp",{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash())
//seedDB();

//======================
//Passport configuration
//======================
app.use(expressSession({
    secret:"My parents are the best",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//To pass currentUser to all the routes
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error      =req.flash("error");
    res.locals.success    =req.flash("success");
    next();
});

//using routes
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(authRoutes);


app.listen(process.env.PORT,process.env.IP,function(){
    console.log("The YelpCamp Server Has Started!!");
});

