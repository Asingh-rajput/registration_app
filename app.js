const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Passport config
require('./config/passport')(passport);

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
// Add this line in your app.js file to use the dashboard route
app.use('/', require('./routes/dashboard'));  // Or './routes/index' depending on your file name

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Static folder for profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set view engine
app.set('view engine', 'ejs');

// Routes
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
