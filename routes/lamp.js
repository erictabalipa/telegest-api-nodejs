const express = require('express');
// const { body } = require('express-validator');

const lampController = require('../controllers/lamp');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/lamps', isAuth, lampController.getLamps);

router.get('/lamp/:lampId', isAuth, lampController.getLamp);

router.post('/new-lamp', isAuth, lampController.postLamp);

router.put('/edit-lamp/:lampId', isAuth, lampController.editLamp);

router.delete('/lamp/:lampId', isAuth, lampController.deleteLamp);

module.exports = router;