const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Registration page
router.get('/register', (req, res) => res.render('register'));

// Registration handle
router.post('/register', upload.single('profilePicture'), (req, res) => {
    const { email, password } = req.body;
    const profilePicture = req.file ? req.file.filename : '';

    let errors = [];

    if (!email || !password) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', { errors });
            } else {
                const newUser = new User({
                    email,
                    password,
                    profilePicture
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                // Send welcome email
                                let transporter = nodemailer.createTransport({
                                    host: process.env.SMTP_HOST,
                                    port: process.env.SMTP_PORT,
                                    secure: false,
                                    auth: {
                                        user: process.env.SMTP_USER,
                                        pass: process.env.SMTP_PASS
                                    }
                                });

                                let mailOptions = {
                                    from: `"Node Registration" <${process.env.SMTP_USER}>`,
                                    to: user.email,
                                    subject: 'Welcome!',
                                    text: 'Thank you for registering!'
                                };

                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    console.log('Message sent: %s', info.messageId);
                                });

                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/auth/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login Page
router.get('/login', (req, res) => res.send('Login Page'));

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
});

// Dashboard page
router.get('/dashboard', (req, res) => {
    res.send('Welcome to your dashboard');
});


module.exports = router;
