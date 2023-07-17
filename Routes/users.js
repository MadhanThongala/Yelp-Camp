const express = require('express')
const router = express.Router();
const User = require('../models/user');
const CatchAsync = require('../utils/CatchAsync');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');



router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', CatchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        //  This below code is for logong ahter registering directly
        req.login(registeredUser,err=>{
            if(err) return next(err);
            req.flash('success', "Welcome to Yelp Camp")
            res.redirect('/campgrounds')

        })

        
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/register')
    }


}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', "Welcome Back!!")
    // res.send(req.user)
    res.redirect('/campgrounds')
})

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
    })

    req.flash('success', "Goodbye!!")
    res.redirect('/campgrounds')

})

module.exports = router