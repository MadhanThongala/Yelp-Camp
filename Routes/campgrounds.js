const express=require('express')
const router=express.Router();
const CampGround = require('../models/campground')

// const CatchAsync = require('../utils/CatchAsync')
const {campgroundSchema}=require('../ValidateSchemas/ValidateSchemas')
const ExpressErrors = require('../utils/ExpressErrors');
const CatchAsync = require('../utils/CatchAsync')

//  This is for middleware for checking is Logged in
const {isLoggedIn}=require('../middleware')





const validateCampground=(req,res,next)=>{
    
    const{error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(msg,404);

    }else{
        next();
    }

}


//  This is an middle to check is the logged one is author or not

const isAuthor= async (req,res,next)=>{
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error',"You do not have permission to do that!!");
        return res.redirect(`/campgrounds/${id}`)

    }
    next();

}


router.get('/', CatchAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//  [Note].... This route should always before '/campgrounds/:id' because it treat new as some id and try to find it
router.get('/new',isLoggedIn, (req, res) => {
    //  This is for checking is signed in or not
    //  .... Note that it is only keep safe the form but by postman we can send it so we habe to use some middleware*
    // if(!req.isAuthenticated()){
    //     req.flash('error',"You must be signed in")
    //     return res.redirect('/login')
    // }
    res.render('campgrounds/new')
})



//  We can also make error handling like this also instead of using CatckErrors function what we done in utils module


// router.post('/campgrounds', async (req, res, next) => {
//     if(!req.body.newCampground) throw new ExpressErrors("Inavalid CampGround Data",400)
//     try {
//         const campground = new CampGround(req.body.newCampground)
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`)

//     } catch (error) {
//         next(error)

//     }


// })

router.post('/',isLoggedIn,validateCampground, CatchAsync(async (req, res, next) => {
    // if (!req.body.newCampground) throw new ExpressErrors("Inavalid CampGround Data", 400)


    //  Thsi schema is not from moongse. this is for validationg data before saome mongoose operations


    // const campgroundSchema=Joi.object({
    //     newCampground:Joi.object({
    //         title:Joi.string().required(),
    //         price:Joi.number().required().min(0),
    //         image:Joi.string().required(),
    //         location:Joi.string().required(),
    //         description:Joi.string().required(),

    //     }).required(),
    // });
    // const{error}=campgroundSchema.validate(req.body);
    // if(error){
    //     const msg=error.details.map(el=>el.message).join(',');
    //     throw new ExpressErrors(msg,404);

    // }

    
    const campground = new CampGround(req.body.campground);
    campground.author=req.user._id;
    await campground.save();
    
    //  For flash message
    req.flash('success',"Successfully made a new campground")
    res.redirect(`/campgrounds/${campground._id}`)

}))


router.get('/:id', CatchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id).populate({
       path: 'reviews',
       populate:{
        path:'author'
       }
    }).populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error',"Cannot find that campground!")
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground })
}))


router.get('/:id/edit',isLoggedIn,isAuthor, CatchAsync(async (req, res) => {
    
    const campground = await CampGround.findById(req.params.id);
    if(!campground){
        req.flash('error',"Cannot find that campground!")
        return res.redirect('/campgrounds');
    }
          
    // res.send(campground);
    res.render('campgrounds/edit', { campground })
}))


router.put('/:id',isLoggedIn, isAuthor, validateCampground, CatchAsync(async (req, res) => {
    // res.send("Hii")

    const { id } = req.params;

    //   Here we can use this or can be middleware

    // const campground=await CampGround.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error',"You do not have permission to do that!!");
    //     return res.redirect(`/campgrounds/${id}`)

    // }
    const campground = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success','Successfully updated camground!!')
    res.redirect(`/campgrounds/${campground._id}`)

}))

router.delete('/:id',isLoggedIn,isAuthor, CatchAsync(async (req, res) => {
    const { id } = req.params;
    
    //  Here we can use below code or a isAuthor middleware 

    // const campground=await CampGround.findById(id);
    // if(!campground.author.equals(req.user._id)){
    //     req.flash('error',"You do not have permission to do that!!");
    //     return res.redirect(`/campgrounds/${id}`)

    // }
    await CampGround.findByIdAndDelete(id);
    
    req.flash('success','Successfully deleted camground!!')
    res.redirect('/campgrounds')
}))


module.exports=router
