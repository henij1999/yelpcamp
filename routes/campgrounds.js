var express     = require("express");
var router      = express.Router();
var campground  = require("../models/campgrounds");
var request     =require("request");


router.get("/",function(req,res){
    res.render("landing");
});

router.get("/campgrounds",function(req,res){
    var checker;
     //To retrieve all the campgrounds
     if (req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       campground.find({"name":regex},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            //to load the page campgrounds
            if(allCampgrounds.length < 1){
                checker="No Match Found";
            }
            res.render("campgrounds",{campgrounds:allCampgrounds,checker:checker});
        }
    });
     }
    else{
         campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            //to load the page campgrounds
            res.render("campgrounds",{campgrounds:allCampgrounds,checker:checker});
        }
    });  
    } 
});

router.get("/campgrounds/new",isLoggedIn,function(req,res){
   res.render("new");
});

router.post("/campgrounds",isLoggedIn,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var loc  =req.body.loaction;
    var price=req.body.price;
    var des=req.body.description;
    var lat,long,value;
    var url="https://geocode-maps.yandex.ru/1.x/?apikey=de769aad-5ca3-4de5-bf67-31dc358437da&format=json&geocode="+req.body.loaction+"&lang=en-US/metaDataProperty/GeocoderResponseMetaData/Point/pos"
    request(url,function (error,response,body) {
        if(!error && response.statusCode==200){
            var data = JSON.parse(body)
            value=data.response.GeoObjectCollection.metaDataProperty.GeocoderResponseMetaData.boundedBy.Envelope.lowerCorner;
            console.log(value);
        }
    })
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var newCamp={name:name,price:price,lat:value,image:image,loaction:loc,description:des,author:author};
    //To create a new campground
    campground.create(newCamp,function(err,camp) {
        if(err){
            req.flash("error","Cannot create the campground");
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});

router.get("/campgrounds/:id",function(req,res){
    //To find the campground with correct id
    campground.findById(req.params.id).populate("comments").exec(function(err,camp) {
        if(err || !camp){
            req.flash("error","Cannot show the campground");
            res.redirect("/campgrounds");
        }else{
               res.render("show",{campground:camp});
        }
    });
});

//to edit a campground
router.get("/campgrounds/:id/edit",userAuthorization,function(req,res){
    campground.findById(req.params.id,function(err,camp){
        if(err || !camp){
            req.flash("error","Cannot find the campground");
            res.redirect("/campgrounds");
        }else{
            res.render("edit",{camp1:camp});
        }
    });
});

//to update a campground
router.put("/campgrounds/:id",userAuthorization,function(req,res){
    campground.findByIdAndUpdate(req.params.id,req.body.campground1,function(err,updatedCamp){
        if(err || !updatedCamp){
            req.flash("error","Cannot update the campground");
            res.redirect("/campgrounds");
        }else{
            req.flash("success","Successfully updated "+updatedCamp.name)
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//to delete 
router.delete("/campgrounds/:id",userAuthorization,function(req,res){
    campground.findByIdAndRemove(req.params.id,function(err) {
        if(err){
            req.flash("error","Cannot delete the campground");
            res.redirect("back");
        }else{
            req.flash("success","Successfully deleted the campground");
            res.redirect("/campgrounds");
        }
    });
});

//middleware function
//To check wether a user is logged in or not
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("error","You need to be logged in to do that")
        res.redirect("/login");
    }
}

//Authorization
//to check whether the user can delete/edit the campground or not

function userAuthorization(req,res,next){
    //to check if someone is logged in or not
    if(req.isAuthenticated()){
        campground.findById(req.params.id,function(err, camp) {
            if(err || !camp){
                req.flash("error","Cannot find the campground")
                res.redirect("back");
            }else{
                //to check wether the logged in user owns the campground or not
                if(camp.author.id.equals(req.user.id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","You are not allowed to do this")
                    res.redirect("/campgrounds/"+camp._id);
                }
            }
        })
    }else{
        req.flash("error","You need to be logged in to do that")
        res.redirect("/login")
    }    
}

//=========================
//FUZZY SEARCH
//=========================
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;