const express = require('express');
const { body } = require('express-validator');

const communicationController = require('../controllers/communication');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/dimmer', isAuth, [
  body('radioId').exists().isInt()
    .custom((value) => {
      if (value >= 1 && value <= 1000) { return true; }
      else { throw new Error(); }
    })
    .withMessage('Invalid or missing parameter: radioId'),
  body('percentage').exists().isNumeric()
    .custom((value) => {
      if (value >= 0 && value <= 100) { return true; }
      else { throw new Error(); }
    })
    .withMessage('Invalid or missing parameter: percentage')
], communicationController.postDimming);

module.exports = router;