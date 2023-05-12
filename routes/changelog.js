const express = require('express');

const changesController = require('../controllers/changelog');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/changes', isAuth, changesController.getChanges);

router.get('/errors', isAuth, changesController.getErrors);

module.exports = router;
