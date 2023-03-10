const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/users', isAuth, authController.getUsers);

router.get('/user/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], authController.getUser);

router.post('/signup',isAuth, [
  body('email')
    .exists()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please enter a valid email.'),
  body('password')
    .exists()
    .isString()
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage('Please enter a valid/stronger password.'),
  body('passwordConfirmation')
		.exists()
		.isString()
		.custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
  body('name')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid "name" field.'),
  body('permission')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid "permission" field.')
], authController.signup);

router.post('/login', [
  body('email')
    .exists()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please enter a valid email.'),
  body('password')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Please enter a valid password.')
], authController.login);

router.get('/permissions/:token', [
  check('token')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid "token" parameter.')
], authController.getPermissions);

router.put('/edit-user/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.'),
  body('name')
    .exists()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Please enter a valid name.'),
  body('email')
    .exists()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please enter a valid email.'),
  body('password')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Please enter a valid password.')
], authController.editUser);

module.exports = router;