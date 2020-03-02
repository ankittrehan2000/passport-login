const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User')

//Login Page
router.get('/login',(req,res) => res.render('login'));

//Registration Page
router.get('/register',(req,res) => res.render('register'));

//Register handle
router.post('/register', (req,res) => {
    const { name,email,password,password2 } = req.body;
    let errors =[];
    
    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({message: 'Please fill all fields'});
    }

    if (password !== password2){
        errors.push({message: 'Passwords do not match'});
    }

    if(password.length<6){
        errors.push({message: 'Password should be 6 characters long'})
    }

    if(errors.length >0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        //Validation Passed
        User.findOne({ email:email })
            .then(user => {
                if(user){
                    //User exists
                    errors.push({message: 'Email already in database'});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    }) 
                }else{
                    const newUser = new User({
                        name,   //name: name
                        email,
                        password,
                    });
                    //Hash Password
                    bcrypt.genSalt(10, (err,salt) =>
                         bcrypt.hash(newUser.password, salt, (err,hash) => {
                            if(err) throw err;
                            newUser.password = hash;

                            //Save the user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_message', 'You are now registered');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err))
                    }))
                }
            });
    }
});

//Login handler
router.post('/login', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});

//Logout handler
router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router