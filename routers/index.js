var express = require('express');
var router = express.Router();
const pageController = require('../controllers/pageController');
const fileController = require('../controllers/fileController');
const signController = require('../controllers/signController');

router.get('/', pageController.home);
router.get('/convert', fileController.convert)
router.get('/sign', signController.signWithPdfLib)

module.exports = router;