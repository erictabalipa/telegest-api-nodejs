const { validationResult } = require('express-validator');

const User = require('../models/user');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');
const DeletedLamp = require('../models/deleted_lamp');

const { checkPermission, registerChange } = require('../utils/aux_functions');

function checkRequest(req) {
  if (typeof req.body === 'undefined') {
    const error = {
      message: 'Request body is empty.',
      statusCode: 400
    }
    return error;
  }
  if (typeof req.body.name !== 'string' ||
    typeof req.body.model === 'undefined' ||
    typeof req.body.model.name !== 'string' ||
    typeof req.body.model.fabricator !== 'string' ||
    typeof req.body.model.fabrication_date === 'undefined' ||
    typeof req.body.model.life_time !== 'number') {
    const error = {
      message: 'Missing data in the request.',
      statusCode: 400
    }
    return error;
  }
  return null;
};

exports.getLamps = async (req, res, next) => { 
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-lamps")
      .catch(err => { throw err; });
    // Fetching Lamps
    const addressed = req.query.addressed;
    let lamps;
    if (addressed == 'true') {
      await Lamp.where('location').exists()
        .then(lampsData => {
          lamps = lampsData;
        })
        .catch(err => {
          const error = new Error('Error finding lamps in database.');
          error.statusCode = 500;
          throw error;
        });
      for (let i=0; i < lamps.length; i++) {
        await Model.findById(lamps[i].model)
          .then(model => {
            lamps[i] = {...lamps[i]._doc, model: model}
          })
          .catch(err => {
            const error = new Error('Error finding lamps model in database.');
            error.statusCode = 500;
            throw error;
          });
      }
      for (let i=0; i < lamps.length; i++) {
        await Location.findById(lamps[i].location)
          .then(location => {
            lamps[i] = {...lamps[i], location: location}
          })
          .catch(err => {
            const error = new Error('Error finding lamps location in database.');
            error.statusCode = 500;
            throw error;
          });
      }
      res.status(200).json(lamps);
    } else if (addressed == 'false') {
      await Lamp.find({ location: { $exists: false } })
        .then(lampsData => {
          lamps = lampsData;
        })
        .catch(err => {
          const error = new Error('Error finding lamps in database.');
          error.statusCode = 500;
          throw error;
        })
      for (let i=0; i < lamps.length; i++) {
        await Model.findById(lamps[i].model)
          .then(model => {
            lamps[i] = {...lamps[i]._doc, model: model}
          })
          .catch(err => {
            const error = new Error('Error finding lamps model in database.');
            error.statusCode = 500;
            throw error;
          });
      }
      res.status(200).json(lamps);
    } else {
      await Lamp.find()
        .then(lampsData => {
          lamps = lampsData;
        })
        .catch(err => {
          const error = new Error('Error finding lamps in database.');
          error.statusCode = 500;
          throw error;
        });
      for (let i=0; i < lamps.length; i++) {
        await Model.findById(lamps[i].model)
          .then(model => {
            lamps[i] = {...lamps[i]._doc, model: model}
          })
          .catch(err => {
            const error = new Error('Error finding lamps model in database.');
            error.statusCode = 500;
            throw error;
          });
      }
      for (let i=0; i < lamps.length; i++) {
        if (typeof lamps[i].location != 'undefined') {
          await Location.findById(lamps[i].location)
            .then(location => {
              lamps[i] = {...lamps[i], location: location}
            })
            .catch(err => {
              const error = new Error('Error finding lamps location in database.');
              error.statusCode = 500;
              throw error;
            });
        }
      }
      res.status(200).json(lamps);
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getLamp = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-lamp")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Lamp
    const lampId = req.params.lampId;
    let lamp = await Lamp.findById(lampId)
      .catch(err => {
        const error = new Error('Error finding lamp in database.');
        error.statusCode = 500;
        throw error;
      })
    if (lamp == null) {
      const error = new Error('Lamp not found.');
      error.statusCode = 404;
      throw error;
    }
    // Fetching Model
    await Model.findById(lamp.model)
      .then(model => {
        lamp = {...lamp._doc, model: model};
      })
      .catch(err => {
        const error = new Error('Error finding lamp model in database.');
        error.statusCode = 500;
        throw error;
      })
    // Fetching Location
    if (typeof lamp.location != 'undefined') {
      await Location.findById(lamp.location)
        .then(location => {
          lamp = {...lamp, location: location}
        })
        .catch(err => {
          const error = new Error('Error finding lamps location in database.');
          error.statusCode = 500;
          throw error;
        });
    }
    res.status(200).json(lamp);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLamp = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "post-lamp")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking if the request is OK
    const reqError = checkRequest(req);
    if (reqError) {
      const error = new Error(reqError.message);
      error.statusCode = reqError.statusCode;
      throw error;
    }
    // Checking if the model already exists
    let modelId = null;
    await Model.where(
      {
        name: req.body.model.name,
        fabricator: req.body.model.fabricator,
        fabrication_date: req.body.model.fabrication_date,
        life_time: req.body.model.life_time 
      })
      .then(models => {
        if (models.length > 0) {
          modelId = models[0]._id;
        }
      })
      .catch(err => {
        const error = new Error('Error searching models in database');
        error.statusCode = 500;
        throw error;
      });
    // If model does not exist -> Create a new one
    if (modelId == null) {
      const model = new Model({
        name: req.body.model.name,
        fabricator: req.body.model.fabricator,
        fabrication_date: req.body.model.fabrication_date,
        life_time: req.body.model.life_time
      })
      await model.save()
        .then(result => {
          modelId = result._id;
        }).catch(err => {
          const error = new Error('Error saving model in database');
          error.statusCode = 500;
          throw error;
        });
    }
    // Create new lamp
    const lamp = new Lamp({
      name: req.body.name,
      model: modelId,
      online: false,
      serviceAssigned: false
    })
    let lampId = '';
    await lamp.save()
      .then(result => {
        lampId = result._id;
        res.status(201).json({ message: 'Lamp created.', lampId: result._id });
      }).catch(err => {
        const error = new Error('Error saving lamp in database');
        error.statusCode = 500;
        throw error;
      });
    // Registering Changes
    await registerChange(req.email, 'created a new lamp.', lampId);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editLamp = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "edit-lamp")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Lamp
    let lamp = await Lamp.findById(req.params.lampId)
      .catch(err => {
        const error = new Error('Error fetching lamp in database.');
        error.statusCode = 500;
        throw error;
      })
    if (lamp == null) {
      const error = new Error('Lamp not found.');
      error.statusCode = 404;
      throw error;
    }
    // Updating Lamp's Name
    lamp.name = req.body.name;
    // Fetching Lamp's Location and updating it
    if (typeof lamp.location != 'undefined') {
      await Location.findById(lamp.location)
        .then(location => {
          location.number = req.body.location.number;
          location.zip_code = req.body.location.zip_code;
          location.street = req.body.location.street;
          location.district = req.body.location.district;
          location.state = req.body.location.state;
          if (typeof req.body.location.reference != 'undefined') {
            location.reference = req.body.location.reference;
          } else if (typeof location.reference != 'undefined') {
            location.reference = undefined;
          }
          location.save();
        })
        .catch(err => {
          const error = new Error("Error fetching lamp's location in database.");
          error.statusCode = 500;
          throw error;
        });
    }
    // Updating Lamp's model
    if (lamp.model != req.body.modelId) {
      await Model.findById(req.body.modelId)
        .then(model => {
          lamp.model = model;
        })
        .catch(err => {
          const error = new Error('Error finding lamp model in database');
          error.statusCode = 500;
          throw error;
        })
    }
    // Saving Lamp
    let lampId = '';
    await lamp.save()
      .then(result => {
        lampId = result._id;
        res.status(200).json({ message: 'Lamp updated.', lampId: result._id });
      }).catch(err => {
        const error = new Error('Error saving lamp in database');
        error.statusCode = 500;
        throw error;
      });
    // Registering Changes
    await registerChange(req.email, 'edited a lamp.', lampId);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteLamp = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "delete-lamp")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Lamp
    const lampId = req.params.lampId;
    let deleteModel = false;
    let deleteLocation = false;
    let lamp = await Lamp.findById(lampId)
      .catch(err => {
        const error = new Error('Error fetching lamp in database');
        error.statusCode = 500;
        throw error;
      })
    if (lamp == null) {
      const error = new Error('Lamp not found.');
      error.statusCode = 404;
      throw error;
    }
    // Checking if Lamp is assigned to a service
    if (lamp.serviceAssigned == true) {
      const error = new Error('Lamps assigned to a service cannot be deleted.');
      error.statusCode = 409;
      throw error;
    }
    // Fetching Lamps with the same model
    await Lamp.where('model').equals(lamp.model)
      .then(lamps => {
        if (lamps.length < 2) {
          deleteModel = true;
        }
      })
      .catch(err => {
        const error = new Error('Error finding lamp model.');
        error.statusCode = 500;
        throw error;
      })
    // Fetching Lamp's Model
    const model = await Model.findById(lamp.model)
      .catch(err => {
        const error = new Error('Error fetching lamp model.');
        error.statusCode = 500;
        throw error;
      })
    // Fetching User responsable for the deleting
    const user = await User.findById(req.userId)
      .catch(err => {
        const error = new Error('Error fetching user.');
        error.statusCode = 500;
        throw error;
      })
    // Saving Lamp in deleted database
    const deletedLamp = new DeletedLamp({
      name: lamp.name,
      model: {
        name: model.name,
        fabricator: model.fabricator,
        fabrication_date: model.fabrication_date,
        life_time: model.life_time,
      },
      deletedBy: user,
      oldId: lamp.id
    })
    if (typeof lamp.location != 'undefined') {
      deleteLocation = true;
      const location = await Location.findById(lamp.location);
      deletedLamp.location = {
        number: location.number,
        zip_code: location.zip_code,
        street: location.street,
        district: location.district,
        state: location.state
      }
      if (typeof location.reference != 'undefined') {
        deletedLamp.location.reference = location.reference;
      }
    }
    await deletedLamp.save()
      .catch(err => {
        const error = new Error('Error saving deleted lamp.');
        error.statusCode = 500;
        throw error;
      });
    // Deleting Lamp, Location and Model (if necessary)
    if (deleteModel && deleteLocation) {
      await Location.findByIdAndDelete(lamp.location);
      await Model.findByIdAndDelete(lamp.model);
      await Lamp.findByIdAndDelete(lamp._id);
    } else if (deleteModel && !deleteLocation) {
      await Model.findByIdAndDelete(lamp.model);
      await Lamp.findByIdAndDelete(lamp._id);
    } else if (!deleteModel && deleteLocation) {
      await Location.findByIdAndDelete(lamp.location);
      await Lamp.findByIdAndDelete(lamp._id);
    } else {
      await Lamp.findByIdAndDelete(lamp._id);
    }
    res.status(200).json({ message: 'lamp deleted' });
    // Registering Changes
    await registerChange(req.email, 'deleted a lamp.', req.params.lampId);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDeletedLamps = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-deletedLamps")
      .catch(err => { throw err; });
    // Fetching Deleted Lamps
    await DeletedLamp.find()
      .then(deletedLamps => {
        res.status(200).json(deletedLamps);
      })
      .catch(err => {
        const error = new Error('Error fetching deleted lamps.');
        error.statusCode = 500;
        throw error;
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}