const Service = require('../models/service');
const User = require('../models/user');
const Permission = require('../models/permission');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');

const { checkPermission, registerChange } = require('../utils/aux_functions');

const { validationResult } = require('express-validator');

exports.getServices = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-services")
      .catch(err => { throw err; });
    // Fetching Services
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-service")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Services
    const service = await Service.findById(req.params.id);
    res.status(200).json(service);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postService = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    if (req.body.priority != 'baixa' && req.body.priority != 'normal' && req.body.priority != 'alta') {
      const error = new Error('Invalid "priority" field.');
      error.statusCode = 400;
      throw error;
    }
    // Permissions check
    await checkPermission(req.permissions, "post-service")
      .catch(err => { throw err; });
    // Checking if the request has services
    if ((typeof req.body.instalations == 'undefined' || req.body.instalations.length == 0) &&
    (typeof req.body.correctiveMaintenances == 'undefined' || req.body.correctiveMaintenances.length == 0) &&
    (typeof req.body.preventiveMaintenances == 'undefined' || req.body.preventiveMaintenances.length == 0)) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      throw error;
    }
    // Checking if the user exists
    await User.findById(req.body.userId)
      .then(user => {
        if (user == null) {
          const error = new Error('User not found.');
          error.statusCode = 404;
          throw error;
        }
      })
      .catch(err => {
        if (typeof err.statusCode == 'undefined') {
          const error = new Error('Error searching user in database.');
          error.statusCode = 500;
          throw error;
        } else {
          throw err;
        }
      });
    // Creating basic service model
    let service = new Service({
      user: req.body.userId,
      code: req.body.code,
      priority: req.body.priority,
      deadline: req.body.deadline,
      instalations: [],
      correctiveMaintenances: [],
      preventiveMaintenances: []
    })
    // Checking if the lamps exists
    // Checking if the lamps can be installed or receive maintenance
    // Checking if the lamps are not assigned to other service
    // Populating our basic service model
    let lampsToAssign = [];
    if (typeof req.body.instalations != 'undefined') {
      if (req.body.instalations.length > 0) {
        for (let index = 0; index < req.body.instalations.length; index++) {
          await Lamp.findById(req.body.instalations[index].lampId)
            .then(lamp => {
              if (lamp == null) {
                const error = new Error('Lamp not found.');
                error.statusCode = 404;
                throw error;
              } else if (typeof lamp.location != 'undefined') {
                const error = new Error('It is not possible to install an addressed lamp.');
                error.statusCode = 409;
                throw error;
              } else if (lamp.serviceAssigned == true) {
                const error = new Error('One or more lamps are already assigned to a service.');
                error.statusCode = 409;
                throw error;
              }
              lampsToAssign.push(lamp._id);
              let installation = {
                lamp: req.body.instalations[index].lampId,
                location: {
                  number: req.body.instalations[index].location.number,
                  zip_code: req.body.instalations[index].location.zip_code,
                  street: req.body.instalations[index].location.street,
                  district: req.body.instalations[index].location.district,
                  state: req.body.instalations[index].location.state
                },
                finished: false
              }
              if (typeof req.body.instalations[index].location.reference != 'undefined') {
                installation.location.reference = req.body.instalations[index].location.reference;
              }
              service.instalations.push(installation);
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              } else {
                throw err;
              }
            });
        }
      }
    }
    if (typeof req.body.correctiveMaintenances != 'undefined') {
      if (req.body.correctiveMaintenances.length > 0) {
        for (let index = 0; index < req.body.correctiveMaintenances.length; index++) {
          await Lamp.findById(req.body.correctiveMaintenances[index])
            .then(lamp => {
              if (lamp == null) {
                const error = new Error('Lamp not found.');
                error.statusCode = 404;
                throw error;
              } else if (typeof lamp.location == 'undefined') {
                const error = new Error('It is not possible to perform maintenance on an unaddressed lamp.');
                error.statusCode = 409;
                throw error;
              } else if (lamp.serviceAssigned == true) {
                const error = new Error('One or more lamps are already assigned to a service.');
                error.statusCode = 409;
                throw error;
              }
              lampsToAssign.push(lamp._id);
              const correctiveMaintenance = {
                lamp: req.body.correctiveMaintenances[index],
                finished: false
              }
              service.correctiveMaintenances.push(correctiveMaintenance);
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              } else {
                throw err;
              }
            });
        }
      }
    }
    if (typeof req.body.preventiveMaintenances != 'undefined') {
      if (req.body.preventiveMaintenances.length > 0) {
        for (let index = 0; index < req.body.preventiveMaintenances.length; index++) {
          await Lamp.findById(req.body.preventiveMaintenances[index])
            .then(lamp => {
              if (lamp == null) {
                const error = new Error('Lamp not found.');
                error.statusCode = 404;
                throw error;
              } else if (typeof lamp.location == 'undefined') {
                const error = new Error('It is not possible to perform maintenance on an unaddressed lamp.');
                error.statusCode = 409;
                throw error;
              } else if (lamp.serviceAssigned == true) {
                const error = new Error('One or more lamps are already assigned to a service.');
                error.statusCode = 409;
                throw error;
              }
              lampsToAssign.push(lamp._id);
              const preventiveMaintenance = {
                lamp: req.body.preventiveMaintenances[index],
                finished: false
              }
              service.preventiveMaintenances.push(preventiveMaintenance);
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              } else {
                throw err;
              }
            });
        }
      }
    }
    // Assigning lamps to a service
    for (let index = 0; index < lampsToAssign.length; index++) {
      await Lamp.findByIdAndUpdate(lampsToAssign[index], { serviceAssigned: true });
    }
    // Creating new service
    let result = await service.save();
    res.status(201).json({ message: 'Service created.' });
    // Registering Changes
    await registerChange(req.email, 'created a new service order.', result._id);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editService = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "edit-service")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking if the service exist
    let service = await Service.findById(req.params.id);
    if (service == null) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }
    // Checking if the users and lamps exists
    let user = null;
    let lamp = null;
    if (req.body.lampsInstalled.length > 0) {
      for (let index = 0; index < req.body.lampsInstalled.length; index++) {
        for (let index2 = 0; index2 < req.body.lampsInstalled[index].usersId.length; index2++) {
          await User.findById(req.body.lampsInstalled[index].usersId[index2])
          .then(userData => {
            user = userData;
          })
          .catch(err => {
            const error = new Error('Error searching user in database.');
            error.statusCode = 500;
            throw error;
          });
          if (user == null) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
          }
        }
        await Lamp.findById(req.body.lampsInstalled[index].lampId)
          .then(lampData => {
            lamp = lampData;
          })
          .catch(err => {
            const error = new Error('Error searching lamp in database.');
            error.statusCode = 500;
            throw error;
          });
          if (lamp == null) {
            const error = new Error('Lamp not found.');
            error.statusCode = 404;
            throw error;
          } else if (typeof lamp.location != 'undefined') {
            const error = new Error('Lamps already addressed cannot be installed.');
            error.statusCode = 400;
            throw error;
          }
      }
    }
    if (req.body.lampsRepaired.length > 0) {
      for (let index = 0; index < req.body.lampsRepaired.length; index++) {
        for (let index2 = 0; index2 < req.body.lampsRepaired[index].usersId.length; index2++) {
          await User.findById(req.body.lampsRepaired[index].usersId[index2])
          .then(userData => {
            user = userData;
          })
          .catch(err => {
            const error = new Error('Error searching user in database.');
            error.statusCode = 500;
            throw error;
          });
          if (user == null) {
            const error = new Error('User not found.');
            error.statusCode = 500;
            throw error;
          }
        }
        await Lamp.findById(req.body.lampsRepaired[index].oldLampId)
          .then(lampData => {
            lamp = lampData;
          })
          .catch(err => {
            const error = new Error('Error searching lamp in database.');
            error.statusCode = 500;
            throw error;
          });
          if (lamp == null) {
            const error = new Error('Lamp not found.');
            error.statusCode = 404;
            throw error;
          } else if (typeof lamp.location == 'undefined') {
            const error = new Error('Unaddressed lamps cannot be replaced.');
            error.statusCode = 400;
            throw error;
          }
        await Lamp.findById(req.body.lampsRepaired[index].newLampId)
          .then(lampData => {
            lamp = lampData;
          })
          .catch(err => {
            const error = new Error('Error searching lamp in database.');
            error.statusCode = 500;
            throw error;
          });
          if (lamp == null) {
            const error = new Error('Lamp not found.');
            error.statusCode = 404;
            throw error;
          } else if (typeof lamp.location != 'undefined') {
            const error = new Error('Lamps already addressed cannot be installed.');
            error.statusCode = 400;
            throw error;
          }
      }
    }
    // Editing and saving service
    service.user = req.userId;
    service.lampsInstalled = [];
    service.lampsRepaired = [];
    if (req.body.lampsInstalled.length > 0) {
      for (let index = 0; index < req.body.lampsInstalled.length; index++) {
        let lampsInstalled = {
          users: [],
          lamp: req.body.lampsInstalled[index].lampId,
          location: {
            number: req.body.lampsInstalled[index].location.number,
            zip_code: req.body.lampsInstalled[index].location.zip_code,
            street: req.body.lampsInstalled[index].location.street,
            district: req.body.lampsInstalled[index].location.district,
            state: req.body.lampsInstalled[index].location.state
          },
          finished: false
        }
        if (req.body.lampsInstalled[index].finished == true) {
          lampsInstalled.finished = true;
          if (typeof req.body.lampsInstalled[index].finishedDate == 'undefined') {
            const error = new Error('Missing finished date on a finished service.');
            error.statusCode = 400;
            throw error;
          }
          lampsInstalled.finishedDate = req.body.lampsInstalled[index].finishedDate;
        }
        if (typeof req.body.lampsInstalled[index].location.reference != 'undefined') {
          lampsInstalled.location.reference = req.body.lampsInstalled[index].location.reference;
        }
        for (let index2 = 0; index2 < req.body.lampsInstalled[index].usersId.length; index2++) {
          lampsInstalled.users.push(req.body.lampsInstalled[index].usersId[index2]);
        }
        service.lampsInstalled.push(lampsInstalled);
      }
    }
    if (req.body.lampsRepaired.length > 0) {
      for (let index = 0; index < req.body.lampsRepaired.length; index++) {
        let lampsRepaired = {
          users: [],
          oldLamp: req.body.lampsRepaired[index].oldLampId,
          newLamp: req.body.lampsRepaired[index].newLampId,
          finished: false
        }
        if (req.body.lampsRepaired[index].finished == true) {
          lampsRepaired.finished = true;
          if (typeof req.body.lampsRepaired[index].finishedDate == 'undefined') {
            const error = new Error('Missing finished date on a finished service.');
            error.statusCode = 400;
            throw error;
          }
          lampsRepaired.finishedDate = req.body.lampsRepaired[index].finishedDate;
        }
        for (let index2 = 0; index2 < req.body.lampsRepaired[index].usersId.length; index2++) {
          lampsRepaired.users.push(req.body.lampsRepaired[index].usersId[index2]);
        }
        service.lampsRepaired.push(lampsRepaired);
      }
    }
    await service.save();
    res.status(201).json({ message: 'Service edited successfully.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "delete-service")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Service
    const service = await Service.findById(req.params.id);
    if (service == null) {
      const error = new Error('Service not found.');
      error.statusCode = 404;
      throw error;
    }
    // Unassigning Lamps from not finished services
    if (typeof service.instalations != 'undefined') {
      if (service.instalations.length > 0) {
        for (let index = 0; index < service.instalations.length; index++) {
          if (service.instalations[index].finished == false) {
            let lamp = await Lamp.findById(service.instalations[index].lamp);
            lamp.serviceAssigned = false;
            await lamp.save();
          }
        }
      }
    }
    if (typeof service.correctiveMaintenances != 'undefined') {
      if (service.correctiveMaintenances.length > 0) {
        for (let index = 0; index < service.correctiveMaintenances.length; index++) {
          if (service.correctiveMaintenances[index].finished == false) {
            let lamp = await Lamp.findById(service.correctiveMaintenances[index].lamp);
            lamp.serviceAssigned = false;
            await lamp.save();
          }
        }
      }
    }
    if (typeof service.preventiveMaintenances != 'undefined') {
      if (service.preventiveMaintenances.length > 0) {
        for (let index = 0; index < service.preventiveMaintenances.length; index++) {
          if (service.preventiveMaintenances[index].finished == false) {
            let lamp = await Lamp.findById(service.preventiveMaintenances[index].lamp);
            lamp.serviceAssigned = false;
            await lamp.save();
          }
        }
      }
    }
    // Deleting Order
    await service.delete();
    res.status(200).json({ message: 'Service deleted successfully.' });
    // Registering Changes
    await registerChange(req.email, 'deleted a service order.', req.params.id);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postServiceDone = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "complete-service")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking if order exist
    let service = await Service.findById(req.body.orderId);
    if (service == null) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }
    // Checking if services exists
    const aux = req.body.servicesCompleted;
    for (let index = 0; index < aux.length; index++) {
      const element = aux[index];
      let check = false;
      if (typeof service.instalations != 'undefined' && 
        service.instalations.length > 0) {
          service.instalations.forEach(installation => {
            const aux = installation._id.toString();
            if (aux == element.serviceId) {
              check = true;
            }
          })
        }
      if (check == false && 
        typeof service.correctiveMaintenances != 'undefined' && 
        service.correctiveMaintenances.length > 0) {
          service.correctiveMaintenances.forEach(correctiveMaintenance => {
            const aux = correctiveMaintenance._id.toString();
            if (aux == element.serviceId) {
              check = true;
            }
          })
        }
      if (check == false && 
        typeof service.preventiveMaintenances != 'undefined' && 
        service.preventiveMaintenances.length > 0) {
          service.preventiveMaintenances.forEach(preventiveMaintenance => {
            const aux = preventiveMaintenance._id.toString();
            if (aux == element.serviceId) {
              check = true;
            }
          })
        }
      if (!check) {
        const error = new Error('Service not found.');
        error.statusCode = 404;
        throw error;
      }
    }
    // Finishing Services
    for (let index = 0; index < req.body.servicesCompleted.length; index++) {
      let finded = false;
      if (typeof service.instalations != 'undefined') {
        if (service.instalations.length > 0) {
          for (let index2 = 0; index2 < service.instalations.length; index2++) {
            if (req.body.servicesCompleted[index].serviceId == service.instalations[index2]._id) {
              finded = true;
              // Updating and Saving Lamp
              const auxLampId = service.instalations[index2].lamp.toString();
              let lamp = await Lamp.findById(auxLampId);
              let newLocation = new Location({
                number: service.instalations[index2].location.number,
                zip_code: service.instalations[index2].location.zip_code,
                street: service.instalations[index2].location.street,
                district: service.instalations[index2].location.district,
                state: service.instalations[index2].location.state
              })
              if (typeof service.instalations[index2].location.reference != 'undefined') {
                newLocation.reference = service.instalations[index2].location.reference;
              }
              await newLocation.save().then(result => {
                lamp.location = result._id;
              })
              lamp.online = true;
              lamp.serviceAssigned = false;
              await lamp.save();
              // Completing Service
              service.instalations[index2].finished = true;
              service.instalations[index2].finishedDate = new Date();
              if (typeof req.body.servicesCompleted[index].materialsUsed != 'undefined') {
                service.instalations[index2].materialsUsed = req.body.servicesCompleted[index].materialsUsed;
              }
            }
          }
        }
      }
      if (finded != true && typeof service.correctiveMaintenances != 'undefined') {
        if (service.correctiveMaintenances.length > 0) {
          for (let index2 = 0; index2 < service.correctiveMaintenances.length; index2++) {
            if (req.body.servicesCompleted[index].serviceId == service.correctiveMaintenances[index2]._id) {
              finded = true;
              if (typeof req.body.servicesCompleted[index].lampId == 'undefined') {
                // Updating and Saving Lamp
                let lamp = await Lamp.findById(service.correctiveMaintenances[index2].lamp.toString());
                lamp.online = true;
                lamp.serviceAssigned = false;
                await lamp.save();
                // Completing Service
                service.correctiveMaintenances[index2].finished = true;
                service.correctiveMaintenances[index2].finishedDate = new Date();
                if (typeof req.body.servicesCompleted[index].materialsUsed != 'undefined') {
                  service.correctiveMaintenances[index2].materialsUsed = req.body.servicesCompleted[index].materialsUsed;
                }
              } else {
                // Updating Lamps
                let oldLamp = await Lamp.findById(service.correctiveMaintenances[index2].lamp.toString());
                let newLamp = await Lamp.findById(req.body.servicesCompleted[index].lampId);
                newLamp.online = true;
                oldLamp.online = false;
                newLamp.serviceAssigned = false;
                oldLamp.serviceAssigned = false;
                newLamp.location = oldLamp.location;
                oldLamp.location = undefined;
                // Saving Lamps
                await newLamp.save();
                await oldLamp.save();
                // Completing Service
                service.correctiveMaintenances[index2].finished = true;
                service.correctiveMaintenances[index2].finishedDate = new Date();
                if (typeof req.body.servicesCompleted[index].materialsUsed != 'undefined') {
                  service.correctiveMaintenances[index2].materialsUsed = req.body.servicesCompleted[index].materialsUsed;
                }
              }
            }
          }
        }
      }
      if (finded != true && typeof service.preventiveMaintenances != 'undefined') {
        if (service.preventiveMaintenances.length > 0) {
          for (let index2 = 0; index2 < service.preventiveMaintenances.length; index2++) {
            if (req.body.servicesCompleted[index].serviceId == service.preventiveMaintenances[index2]._id) {
              finded = true;
              if (typeof req.body.servicesCompleted[index].lampId == 'undefined') {
                // Updating and Saving Lamp
                let lamp = await Lamp.findById(service.preventiveMaintenances[index2].lamp.toString());
                lamp.online = true;
                lamp.serviceAssigned = false;
                await lamp.save();
                // Completing Service
                service.preventiveMaintenances[index2].finished = true;
                service.preventiveMaintenances[index2].finishedDate = new Date();
                if (typeof req.body.servicesCompleted[index].materialsUsed != 'undefined') {
                  service.preventiveMaintenances[index2].materialsUsed = req.body.servicesCompleted[index].materialsUsed;
                }
              } else {
                // Updating Lamps
                let oldLamp = await Lamp.findById(service.preventiveMaintenances[index2].lamp.toString());
                let newLamp = await Lamp.findById(req.body.servicesCompleted[index].lampId);
                newLamp.online = true;
                oldLamp.online = false;
                newLamp.serviceAssigned = false;
                oldLamp.serviceAssigned = false;
                newLamp.location = oldLamp.location;
                oldLamp.location = undefined;
                // Saving Lamps
                await newLamp.save();
                await oldLamp.save();
                // Completing Service
                service.preventiveMaintenances[index2].finished = true;
                service.preventiveMaintenances[index2].finishedDate = new Date();
                if (typeof req.body.servicesCompleted[index].materialsUsed != 'undefined') {
                  service.preventiveMaintenances[index2].materialsUsed = req.body.servicesCompleted[index].materialsUsed;
                }
              }
            }
          }
        }
      }
    }
    // Check All Services Done
    let all_done = true;
    if (typeof service.instalations != 'undefined') {
      if (service.instalations.length > 0) {
        service.instalations.forEach(installation => {
          if (installation.finished != true) {
            all_done = false;
          }
        })
      }
    }
    if (typeof service.correctiveMaintenances != 'undefined') {
      if (service.correctiveMaintenances.length > 0) {
        service.correctiveMaintenances.forEach(correctiveMaintenance => {
          if (correctiveMaintenance.finished != true) {
            all_done = false;
          }
        })
      }
    }
    if (typeof service.preventiveMaintenances != 'undefined') {
      if (service.preventiveMaintenances.length > 0) {
        service.preventiveMaintenances.forEach(preventiveMaintenance => {
          if (preventiveMaintenance.finished != true) {
            all_done = false;
          }
        })
      }
    }
    if (all_done) {
      service.finishedDate = new Date();
    }
    // Saving Service
    await service.save();
    res.status(200).json({ message: 'Service updated successfully.' });
    // Registering Changes
    for (let index = 0; index < req.body.servicesCompleted.length; index++) {
      req.body.servicesCompleted[index];
      await registerChange(
        req.email,
        'completed the service "' + req.body.servicesCompleted[index] + '" from order.',
        req.body.orderI
      );
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};