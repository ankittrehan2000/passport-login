const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;

//Connect to MongoDB
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

//EJS - setting the middle tier
app.use(expressLayouts); 
app.set('view engine','ejs') //set the view engine to look for ejs files

//BodyParser
app.use(express.urlencoded({ extended:false }));

//Express Session Middleware
app.use(session({
    secret: 'doesnotmatter',
    resave: true,
    saveUninitialized: true,
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Vars
app.use((req,res, next)=> {
    res.locals.success_message = req.flash('succes_msg');
    res.locals.error_message = req.flash('error_msg');
    res.locals.error = req.flash('error')
    next();
});

//Routes
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));

const PORT = process.env.PORT || 3030;

app.listen(PORT, console.log(`Server started`));