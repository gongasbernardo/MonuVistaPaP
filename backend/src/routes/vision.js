const express = require('express');
const { recognizeMonument } = require('../controllers/visionController');

const router = express.Router();

router.post('/recognize', recognizeMonument);

module.exports = router;
