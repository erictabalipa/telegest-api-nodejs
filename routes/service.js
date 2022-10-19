const express = require('express');
// const { body } = require('express-validator');

const serviceController = require('../controllers/service');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/services', isAuth, serviceController.getServices);

router.get('/service/:id', isAuth, serviceController.getService);

router.post('/new-service', isAuth, serviceController.postService);

// router.put('/edit-service/:id', isAuth, serviceController.editService);

router.delete('/delete-service/:id', isAuth, serviceController.deleteService);

router.post('/complete-service', isAuth, serviceController.postServiceDone);

module.exports = router;