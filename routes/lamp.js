const express = require('express');
const { check, body } = require('express-validator');

const lampController = require('../controllers/lamp');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/lamps', isAuth, lampController.getLamps);

router.get('/lamp/:lampId', isAuth, [
  check('lampId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], lampController.getLamp);

router.post('/new-lamp', isAuth, [
  body('name')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "name" field.'),
  check('model.name')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "model.name" field.'),
  check('model.fabricator')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "model.fabricator" field.'),
  check('model.fabrication_date')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "model.fabrication_date" field.'),
  check('model.life_time')
    .exists()
    .isNumeric()
    .notEmpty()
    .withMessage('Invalid/missing "model.life_time" field.')
], lampController.postLamp);

router.put('/edit-lamp/:lampId', isAuth, [
  check('lampId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.'),
  body('name')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "name" field.'),
  body('modelId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid/missing "modelId" field.'),
], lampController.editLamp);

router.delete('/lamp/:lampId', isAuth, [
  check('lampId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], lampController.deleteLamp);

router.get('/lamps-deleted', isAuth, lampController.getDeletedLamps);

module.exports = router;