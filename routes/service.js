const express = require('express');
// const { body } = require('express-validator');

const serviceController = require('../controllers/service');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/new-service', isAuth, serviceController.postService);

module.exports = router;