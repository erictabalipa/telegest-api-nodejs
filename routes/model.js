const express = require('express');
// const { body } = require('express-validator');

const modelController = require('../controllers/model');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/models', isAuth, modelController.getModels);

router.get('/model/:id', isAuth, modelController.getModel);

router.put('/model/:id', isAuth, modelController.editModel);

module.exports = router;