const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const {verifyToken} = require('../middleware/authMiddleware')


router.post('/add-family-member', verifyToken, familyController.addFamilyMember);
router.post('/check-in-family', verifyToken, familyController.checkInFamily);

module.exports = router;
