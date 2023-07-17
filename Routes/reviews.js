const express=require('express')
//      *******Note******  {mergeParams:true}this should be written if we need previous path params
const router=express.Router({mergeParams:true});
const Review=require('../models/Review');
const CampGround = require('../models/campground')
const ExpressErrors = require('../utils/ExpressErrors');
const {reviewSchema}=require('../ValidateSchemas/ValidateSchemas')
const CatchAsync = require('../utils/CatchAsync')
const { isLoggedIn } = require('../middleware');






const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(msg,404);

    }else{
        next()
    }
}

//  Middleware to check is logged in is author for that review

const isReviewAuthor=async (req,res,next)=>{
    const {id,review_id} = req.params;
    const review = await Review.findById(review_id);
    if(!review.author.equals(req.user._id)){
        req.flash('error',"You do not have permission to do that!!");
        return res.redirect(`/campgrounds/${id}`)

    }
    next();
}


router.post('/',isLoggedIn,validateReview,CatchAsync(async (req,res)=>{
    const campground=await CampGround.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);


    await campground.save();
    await review.save();
    req.flash("success","Created New Rewiew!")
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

//  For deletinga a paricular review from particular campground
router.delete('/:review_id',isLoggedIn,isReviewAuthor,CatchAsync(async (req,res)=>{
    const {id,review_id}=req.params;
    // this next line will remove the id or reference associate with that review in the mangoose campgrounds collections
    await CampGround.findByIdAndUpdate(id,{$pull:{reviews:review_id}})

    //  And this will delte the review thatis with that id
    await Review.findByIdAndDelete(req.params.review_id)
    req.flash('success',"successfully deleted review!")
    res.redirect(`/campgrounds/${id}`)
    
}))


module.exports=router

