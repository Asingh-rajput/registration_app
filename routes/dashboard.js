// In routes/index.js or routes/dashboard.js

const express = require('express');
const router = express.Router();

// Dashboard page
router.get('/dashboard', (req, res) => {
    res.send('Welcome to your dashboard');
});

module.exports = router;
