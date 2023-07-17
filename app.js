const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const CampGround = require('./models/campground')
const methodOverride = require('method-override')
// For styling
const ejsMate = require('ejs-mate');
const CatchAsync = require('./utils/CatchAsync')
//  Importing Error Calss 
const ExpressErrors = require('./utils/ExpressErrors');
//  For server side validation
const Joi=require('joi')
const {campgroundSchema,reviewSchema}=require('./ValidateSchemas/ValidateSchemas')

//  For Reviews
const Review=require('./models/Review');

//  for campground routes
const campgroundRoutes=require('./Routes/campgrounds')
const reviewRoutes=require('./Routes/reviews')
const usersRoutes=require('./Routes/users')

// For Session
const session=require('express-session');

// For Flash
const flash=require('connect-flash')

//  For Authentication
const passport =require('passport');
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const cookieParser = require('cookie-parser')









mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Database Connected!!!')
    })
    .catch(err => {
        console.log("Ohh No!!! Database connection error!!!");
        console.log(err);
    })


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(methodOverride('_method'))

// For Serving my Public Directory
app.use(express.static(path.join(__dirname,'public')))







//  This is the middle function for validation

// const validateCampground=(req,res,next)=>{
    
//     const{error}=campgroundSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(el=>el.message).join(',');
//         throw new ExpressErrors(msg,404);

//     }else{
//         next();
//     }

// }
// const validateReview=(req,res,next)=>{
//     const {error}=reviewSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(el=>el.message).join(',');
//         throw new ExpressErrors(msg,404);

//     }else{
//         next()
//     }
// }

//  For Sessions
const sessionConfig={
    secret:"Heythisisasecret",
    resave:true,
    saveUnintialized:true,
    cookie:{
        // httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,

    }

}
app.use(session(sessionConfig))

//  For flash
app.use(flash())




//........  For Authentication
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

   //  serializeUser its about how do we store the data in the session and it reverse is deserializeUser 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    //  These are like variables and can used anyware

    //  This below line is for dynamic states in navbar
    res.locals.currentUser=req.user; 
    // res.send(currentUser)
    // console.log(req.locals)  
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error')
    next();
   

})


    //    Example for the this authentication
app.get('/fakeuser', async (req,res)=>{
    //  We wont pass password here and observe that we not defined username in Schema object in User but made it here directly thats the bebefit
    const user=new User({email:'madhan@gmail.com',username:'madhan'})
   //  Here the password will be hashed 
    const newUser=await User.register(user,'manisha')
    res.send(newUser)
})




//  For Routes
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',usersRoutes);


app.get('/', (req, res) => {
    res.render('home')
})

// app.get('/campgrounds', CatchAsync(async (req, res) => {
//     const campgrounds = await CampGround.find({});
//     res.render('campgrounds/index', { campgrounds })
// }))

// //  [Note].... This route should always before '/campgrounds/:id' because it treat new as some id and try to find it
// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new')
// })



// //  We can also make error handling like this also instead of using CatckErrors function what we done in utils module


// // app.post('/campgrounds', async (req, res, next) => {
// //     if(!req.body.newCampground) throw new ExpressErrors("Inavalid CampGround Data",400)
// //     try {
// //         const campground = new CampGround(req.body.newCampground)
// //         await campground.save();
// //         res.redirect(`/campgrounds/${campground._id}`)

// //     } catch (error) {
// //         next(error)

// //     }


// // })

// app.post('/campgrounds',validateCampground, CatchAsync(async (req, res, next) => {
//     // if (!req.body.newCampground) throw new ExpressErrors("Inavalid CampGround Data", 400)


//     //  Thsi schema is not from moongse. this is for validationg data before saome mongoose operations


//     // const campgroundSchema=Joi.object({
//     //     newCampground:Joi.object({
//     //         title:Joi.string().required(),
//     //         price:Joi.number().required().min(0),
//     //         image:Joi.string().required(),
//     //         location:Joi.string().required(),
//     //         description:Joi.string().required(),

//     //     }).required(),
//     // });
//     // const{error}=campgroundSchema.validate(req.body);
//     // if(error){
//     //     const msg=error.details.map(el=>el.message).join(',');
//     //     throw new ExpressErrors(msg,404);

//     // }

    
//     const campground = new CampGround(req.body.campground)
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`)

// }))


// app.get('/campgrounds/:id', CatchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await CampGround.findById(id).populate('reviews');

//     res.render('campgrounds/show', { campground })
// }))


// app.get('/campgrounds/:id/edit', CatchAsync(async (req, res) => {
//     const campground = await CampGround.findById(req.params.id);
//     // res.send(campground);
//     res.render('campgrounds/edit', { campground })
// }))

// app.put('/campgrounds/:id',validateCampground, CatchAsync(async (req, res) => {
//     // res.send("Hii")
//     const { id } = req.params;
//     const campground = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
//     res.redirect(`/campgrounds/${campground._id}`)

// }))

// app.delete('/campgrounds/:id', CatchAsync(async (req, res) => {
//     const { id } = req.params;
//     await CampGround.findByIdAndDelete(id);
//     res.redirect('/campgrounds')
// }))

// app.post('/campgrounds/:id/reviews',validateReview,CatchAsync(async (req,res)=>{
//     const campground=await CampGround.findById(req.params.id);
//     const review=new Review(req.body.review);
//     campground.reviews.push(review);
//     await campground.save();
//     await review.save();
//     res.redirect(`/campgrounds/${campground._id}`)
    
// }))

// //  For deletinga a paricular review from particular campground
// app.delete('/campgrounds/:id/reviews/:review_id',CatchAsync(async (req,res)=>{
//     const {id,review_id}=req.params;
//     // this next line will remove the id or reference associate with that review in the mangoose campgrounds collections
//     await CampGround.findByIdAndUpdate(id,{$pull:{reviews:review_id}})

//     //  And this will delte the review thatis with that id
//     await Review.findByIdAndDelete(req.params.review_id)
//     res.redirect(`/campgrounds/${id}`)
    
// }))



// This route is for handling every path (include get,post,put,delete) if any of the above routes match 
app.all('*', (req, res, next) => {
    // res.send("Ho no!! Not found 404 ")
    next(new ExpressErrors("Page not Found", 404))
})









//  Here is our error handler
app.use((err, req, res, next) => {
    // this wont work
    // const { message = "Something went wrong", statusCode = 505 } = err;

    const {  statusCode = 505 } = err;
    if(!err.message) err.message='Oh no,Something Went Wrong!'
    res.status(statusCode).render('error',{err});
    // res.send("Ho no something wrong")
})







app.listen('3000', () => {
    console.log("Serving on Port 3000!!!")
})
