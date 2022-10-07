// const { validationResult } = require('express-validator');

const Model = require('../models/model');
const Permission = require('../models/permission');

exports.getModels = async (req, res, next) => {
  try {
    // Permissions check
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "get-models") {
              checkPermission = false;
          }
        })
        if (checkPermission) {
          const error = new Error("You don't have permission to do this.");
          error.statusCode = 401;
          throw error;
        }
      })
      .catch (err => {
        if (err.statusCode == 401) {
            throw err;
        }
        const error = new Error('Error finding permissions in database.');
        error.statusCode = 500;
        throw error;
      });
    // Fetching all models
    await Model.find()
      .then(lamps => {
        res.status(200).json(lamps);
      })
      .catch(err => {
        const error = new Error('Error finding models in database.');
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
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "get-model") {
              checkPermission = false;
          }
        })
        if (checkPermission) {
          const error = new Error("You don't have permission to do this.");
          error.statusCode = 401;
          throw error;
        }
      })
      .catch (err => {
        if (err.statusCode == 401) {
            throw err;
        }
        const error = new Error('Error finding permissions in database.');
        error.statusCode = 500;
        throw error;
      });
    // Fetching model
    await Model.findById(req.params.id)
      .then(lamp => {
        res.status(200).json(lamp);
      })
      .catch(err => {
        const error = new Error('Error finding model in database.');
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
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "edit-model") {
              checkPermission = false;
          }
        })
        if (checkPermission) {
          const error = new Error("You don't have permission to do this.");
          error.statusCode = 401;
          throw error;
        }
      })
      .catch (err => {
        if (err.statusCode == 401) {
            throw err;
        }
        const error = new Error('Error finding permissions in database.');
        error.statusCode = 500;
        throw error;
      });
    // Fetching model
    let model;
    await Model.findById(req.params.id)
      .then(fetchedModel => {
        model = fetchedModel;
      })
      .catch(err => {
        const error = new Error('Error finding model in database.');
        error.statusCode = 500;
        throw error;
      });
    // Editing model
    model.name = req.body.name;
    model.fabricator = req.body.fabricator;
    model.fabrication_date = req.body.fabrication_date;
    model.life_time = req.body.life_time;
    await model.save()
      .then(result => {
        res.status(200).json({ message: 'Model updated.', modelId: result._id });
      }).catch(err => {
        const error = new Error('Error saving model in database');
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