var mongoose       =   require("mongoose");


var campSchema=new mongoose.Schema(
    {
        name:String,
        price:String,
        image:String,
        location:String,
        lat:Number,
        lon:Number,
        description:String,
        comments:[
                    {
                        type:mongoose.Schema.Types.ObjectId,
                        ref:"Comment"
                    }
                ],
        author:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            username:String
        }
    });
module.exports=mongoose.model("campground",campSchema);