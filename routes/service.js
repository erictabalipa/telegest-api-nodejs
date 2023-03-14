const express = require('express');
const { check, body } = require('express-validator');

const serviceController = require('../controllers/service');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/services', isAuth, serviceController.getServices);

router.get('/service/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], serviceController.getService);

router.post('/new-service', isAuth, [
  body('userId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "userId" field.'),
  body('code')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "code" field.'),
  body('priority')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "priority" field.'),
  body('deadline')
    .exists()
    .isString()
    .withMessage('Invalid or missing "deadline" field.'),
  body('instalations')
    .isArray()
    .withMessage('Invalid "instalations" field.'),
  body('correctiveMaintenances')
    .isArray()
    .withMessage('Invalid "correctiveMaintenances" field.'),
  body('preventiveMaintenances')
    .isArray()
    .withMessage('Invalid "preventiveMaintenances" field.')
], serviceController.postService);

router.put('/edit-service/:id', isAuth, [
  body('userId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "userId" field.'),
  body('code')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "code" field.'),
  body('priority')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "priority" field.'),
  body('deadline')
    .exists()
    .isString()
    .withMessage('Invalid or missing "deadline" field.'),
  body('instalations')
    .isArray()
    .withMessage('Invalid "instalations" field.'),
  body('correctiveMaintenances')
    .isArray()
    .withMessage('Invalid "correctiveMaintenances" field.'),
  body('preventiveMaintenances')
    .isArray()
    .withMessage('Invalid "preventiveMaintenances" field.')
], serviceController.editService);

router.delete('/delete-service/:id', isAuth, [
  check('id')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "id" parameter.')
], serviceController.deleteService);

router.post('/complete-service', isAuth, [
  body('orderId')
    .exists()
    .isString()
    .notEmpty()
    .withMessage('Invalid or missing "orderId" field.'),
  body('servicesCompleted')
    .exists()
    .isArray()
    .notEmpty()
    .withMessage('Invalid or missing "servicesCompleted" field.')
], serviceController.postServiceDone);

router.get('/services-deleted', isAuth, serviceController.getDeletedServices);

module.exports = router;