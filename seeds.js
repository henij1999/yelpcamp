var mongoose       =   require("mongoose");
var campground     =   require("./models/campgrounds")
var Comment        =   require("./models/comments")

var data=[
    {
        name:"Lake view",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuxM8BKoRkzITVH3AKYqi5Gs8V_a-K4xTpEiDEdKzbxzfriqW5eg",
        description:"There is a lake"
    },
    {
        name:"Sky view",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7cIuo_zBSCcFGx7-2FPn8RFRLdi1G_UPNW10QL83_KyHNoLUCDA",
        description:"There is a sky"
    },
    {
        name:"View",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwf6IzMvBQyxF5ESk8U3kZSHLLO0-4qcvnWHMmtCXJo2GEx8UC",
        description:"There is an awesome view"
    }
    
    ]


function seedDB() {
    campground.remove({},function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Removed");
        data.forEach(function(camp){
            campground.create(camp,function(err,camp1) {
                if(err){
                    console.log(err);
                }else{
                    console.log("Camp1 created");
                    Comment.create(
                        {
                            text:"This is an awesome camp",
                            author:"Henil"
                        },function(err,comment){
                            if(err){console.log(err);}
                            else{
                                camp1.comments.push(comment);
                                camp1.save();
                                console.log("Added a comment");
                        }
                        })
                }
            })
        })
    }
});
}


module.exports = seedDB;