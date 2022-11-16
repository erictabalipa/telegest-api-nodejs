// const { validationResult } = require('express-validator');

const Model = require('../models/model');
const Permission = require('../models/permission');

const { checkPermission } = require('../utils/aux_functions');

exports.getModels = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-models")
      .catch(err => { throw err; });
    // Fetching all models
    await Model.find()
      .then(lamps => {
        res.status(200).json(lamps);
      })
      .catch(err => {
        const error = new Error('Error fetching models.');
        error.statusCode = 500;
        throw error;
      });
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

exports.getModel = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-model")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching model
    await Model.findById(req.params.id)
      .then(lamp => {
        if (lamp == null) {
          const error = new Error('Model not found.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json(lamp);
      })
      .catch(err => {
        const error = new Error('Error fetching model.');
        error.statusCode = 500;
        throw error;
      });
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};

exports.editModel = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "edit-model")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching model
    let model = await Model.findById(req.params.id)
      .catch(err => {
        const error = new Error('Error fetching model.');
        error.statusCode = 500;
        throw error;
      });
    if (model == null) {
      const error = new Error('Model not found.');
      error.statusCode = 404;
      throw error;
    }
    // Editing model
    model.name = req.body.name;
    model.fabricator = req.body.fabricator;
    model.fabrication_date = req.body.fabrication_date;
    model.life_time = req.body.life_time;
    // Saving Model
    await model.save()
      .then(result => {
        res.status(200).json({ message: 'Model updated.', modelId: result._id });
      }).catch(err => {
        const error = new Error('Error saving model.');
        error.statusCode = 500;
        throw error;
      });
    // Registering Changes
    await registerChange(req.email, 'edited a model.', req.params.id);
  } catch (err) {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
  }
};