const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const listingsRouter = require('./routes/listing');
const reviewsRouter = require('./routes/review.js');
const userRouter = require('./routes/user');

const MONGODB_URL = "mongodb://127.0.0.1:27017/vandanest";

main().then(() => {
    console.log('Database connection established');
})
    .catch(err => {
        console.error('Database connection error:', err);
    });

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const sessionOptions = {
    secret: 'mysupersecretcode',
    resave: false, // don't save session if unmodified
    saveUninitialized: true,  // save new sessions  
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.get('/', (req, res) => {  // defines what to do when a request comes
    res.send('Hi, I am root');
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

// app.get('/demouser', async (req, res) => {
//     let fakeUser = new User({
//          username: 'fake-User',
//           email: 'user1@gmail.com'
//         });

//     let registeredUser = await User.register(fakeUser, 'hello123'); 
//     res.send(registeredUser);
// });


app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});


app.listen(8080, () => { // turns the server on and starts waiting for requests
    console.log('Server is running on port 8080');
});