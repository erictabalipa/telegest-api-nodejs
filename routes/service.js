const express = require('express');
// const { body } = require('express-validator');

const serviceController = require('../controllers/service');

const router = express.Router();

router.post('/new-service', serviceController.postService);

module.exports = router;