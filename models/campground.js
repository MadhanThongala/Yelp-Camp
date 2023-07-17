const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review =require('./Review')


const CampGroundSchema=new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]

})


//  this a Post Middleware for deleting all the asocaiated reviews from the database after deleting that particulat campground
//  And we have to use a particular word for every method now here for findByIdAndDelete we use findOneAndDelete here otherwise this middleware wont be triggered

CampGroundSchema.post('findOneAndDelete',async function(doc){
    // And here the doc is campground which is deleted
    // console.log(doc)
    if(doc){
       await Review.deleteMany({
        //  below code is for delete all the reviews which has ids in the doc reviews array
           _id:{
            $in:doc.reviews
           }
       })
    }

})
const CampGround=mongoose.model('CampGround',CampGroundSchema);




module.exports =CampGround 