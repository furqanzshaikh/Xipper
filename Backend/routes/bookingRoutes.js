const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const {verifyToken} = require('../middleware/authMiddleware')


router.post('/book-hotel', verifyToken, bookingController.bookHotel);

module.exports = router;
