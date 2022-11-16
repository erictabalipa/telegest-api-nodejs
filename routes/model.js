const express = require('express');
// const { body } = require('express-validator');

const modelController = require('../controllers/model');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/models', isAuth, modelController.getModels);

router.get('/model/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], modelController.getModel);

router.put('/model/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.'),
  body('name')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "name" field.'),
  body('fabricator')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "fabricator" field.'),
  body('fabrication_date')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "fabrication_date" field.'),
  body('life_time')
    .exists()
    .isNumeric()
    .notEmpty()
    .withMessage('Invalid/missing "life_time" field.')
], modelController.editModel);

module.exports = router;