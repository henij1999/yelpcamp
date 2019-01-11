var express     = require("express");
var router      = express.Router();
var campground  = require("../models/campgrounds");
var Comment     = require("../models/comments");

router.get("/campgrounds/:id/comments/new",isLoggedIn,function(req, res) {
    campground.findById(req.params.id,function(err,camp) {
        if(err || !camp){
            req.flash("error","Cannot find the campground")
            res.redirect("/campgrounds");
        }
        else{
            res.render("newComments",{camp:camp});
        }
    });
});

router.post("/campgrounds/:id/comments",isLoggedIn,function(req,res) {
    campground.findById(req.params.id,function(err, camp) {
        if(err){
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,function (err,comment) {
                if(err){
                    res.redirect("/campgrounds");
                }else{
                    comment.author=req.user.username;
                    comment.save();
                    camp.comments.push(comment);
                    camp.save();
                    req.flash("success","Successfully added the comment")
                    res.redirect("/campgrounds/"+ camp._id);
                }
            });
        }
    });
});


//Editing a comment
router.get("/campgrounds/:id/comments/:comment_id/edit",commentAuthorization,function(req,res){
    Comment.findById(req.params.comment_id,function(err, comment) {
        if(err || !comment){
            res.redirect("back");
        }else{
            res.render("editComment",{camp_id:req.params.id,comment:comment});
        }
    })
})

//updating a comment

router.put("/campgrounds/:id/comments/:comment_id",commentAuthorization,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err || !updatedComment){
            res.redirect("back");
        }else{
            req.flash("success","Successfully edited the comment")
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})


//Delete route
router.delete("/campgrounds/:id/comments/:comment_id",commentAuthorization,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Successfully deleted the comment")
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
})


//====================
//middleware functions
//=====================

//to check wether the comment is owned to the current user
function commentAuthorization(req,res,next){
    //to check if someone is logged in or not
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err, comment) {
            if(err || !comment){
                res.redirect("back");
            }else{
                //to check wether the logged in user owns the campground or not
                if(comment.author == req.user.username || req.user.isAdmin){
                    next();
                }else{
                    res.redirect("back");
                }
            }
        })
    }else{
        res.redirect("back")
    }    
}


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