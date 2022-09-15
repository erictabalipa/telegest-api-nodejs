const express = require('express');
// const { body } = require('express-validator');

const lampController = require('../controllers/lamp');

const router = express.Router();

router.get('/lamps', lampController.getLamps);

router.get('/lamp/:lampId', lampController.getLamp);

router.post('/new-lamp', lampController.postLamp);

router.put('/edit-lamp/:lampId', lampController.editLamp);

router.delete('/lamp/:lampId', lampController.deleteLamp);

module.exports = router;