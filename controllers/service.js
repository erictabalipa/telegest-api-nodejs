const Service = require('../models/service');
const User = require('../models/user');
const Permission = require('../models/permission');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');
const DeletedService = require('../models/deleted_service');

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
              if (typeof req.body.instalations[index].radioId != 'undefined') {
                installation.radioId = req.body.instalations[index].radioId;
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
    if (req.body.priority != 'baixa' && req.body.priority != 'normal' && req.body.priority != 'alta') {
      const error = new Error('Invalid "priority" field.');
      error.statusCode = 400;
      throw error;
    }
    // Checking if the request has services
    if ((typeof req.body.instalations == 'undefined' || req.body.instalations.length == 0) &&
    (typeof req.body.correctiveMaintenances == 'undefined' || req.body.correctiveMaintenances.length == 0) &&
    (typeof req.body.preventiveMaintenances == 'undefined' || req.body.preventiveMaintenances.length == 0)) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      throw error;
    }
    // Checking if the service exist
    let service = await Service.findById(req.params.id);
    if (service == null) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
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
    // Editing basic data and checking lamps to be unassigned
    service.user = req.body.userId;
    service.code = req.body.code;
    service.priority = req.body.priority;
    service.deadline = req.body.deadline;
    let lampsToUnassign = [];
    if (typeof req.body.instalations != 'undefined') {
      service.instalations.forEach(element => {
        let finded = false;
        req.body.instalations.forEach(reqInstalation => {
          if (element.lamp == reqInstalation.lampId) {
            finded = true;
          }
        })
        if (!finded && typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
        if (!finded) { lampsToUnassign.push(element.lamp); }
      })
    } else {
      service.instalations.forEach(element => {
        if (typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
      })
    }
    if (typeof req.body.correctiveMaintenances != 'undefined') {
      service.correctiveMaintenances.forEach(element => {
        let finded = false;
        req.body.correctiveMaintenances.forEach(reqCorrectiveMaintenance => {
          if (element.lamp == reqCorrectiveMaintenance) {
            finded = true;
          }
        })
        if (!finded && typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
        if (!finded) { lampsToUnassign.push(element.lamp); }
      })
    } else {
      service.correctiveMaintenances.forEach(element => {
        if (typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
      })
    }
    if (typeof req.body.preventiveMaintenances != 'undefined') {
      service.preventiveMaintenances.forEach(element => {
        let finded = false;
        req.body.preventiveMaintenances.forEach(reqPreventiveMaintenance => {
          if (element.lamp == reqPreventiveMaintenance) {
            finded = true;
          }
        })
        if (!finded && typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
        if (!finded) { lampsToUnassign.push(element.lamp); }
      })
    } else {
      service.preventiveMaintenances.forEach(element => {
        if (typeof element.finished != 'undefined') {
          if (element.finished == true) {
            const error = new Error('Finished installations and maintenance cannot be removed from the order.');
            error.statusCode = 409;
            throw error;
          }
        }
      })
    }
    // Checking lamps to assign
    let lampsToAssign = [];
    if (typeof req.body.instalations != 'undefined') {
      req.body.instalations.forEach(async (newElement) => {
        let finded = false;
        service.instalations.forEach(async (element) => {
          if (newElement.lampId == element.lamp) {
            finded = true;
          }
        })
        if (!finded) {
          lampsToAssign.push(newElement.lampId);
          await Lamp.findById(newElement.lampId)
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
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              }
              throw err;
            });
        }
      })
    }
    if (typeof req.body.correctiveMaintenances != 'undefined') {
      req.body.correctiveMaintenances.forEach(async (newElement) => {
        let finded = false;
        service.correctiveMaintenances.forEach(async (element) => {
          if (newElement == element.lamp) {
            finded = true;
          }
        })
        if (!finded) {
          lampsToAssign.push(newElement);
          await Lamp.findById(newElement)
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
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              }
              throw err;
            });
        }
      })
    }
    if (typeof req.body.preventiveMaintenances != 'undefined') {
      req.body.preventiveMaintenances.forEach(async (newElement) => {
        let finded = false;
        service.preventiveMaintenances.forEach(async (element) => {
          if (newElement == element.lamp) {
            finded = true;
          }
        })
        if (!finded) {
          lampsToAssign.push(newElement);
          await Lamp.findById(newElement)
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
            })
            .catch(err => {
              if (typeof err.statusCode == 'undefined') {
                const error = new Error('Error searching lamp in database.');
                error.statusCode = 500;
                throw error;
              }
              throw err;
            });
        }
      })
    }
    // Editing instalations
    let newInstalations = [];
    service.instalations.forEach(element => {
      if (element.finished == true) {
        newInstalations.push(element);
      }
    })
    req.body.instalations.forEach(element => {
      let finded1 = false;
      lampsToAssign.forEach(toAssign => {
        if (element.lampId == toAssign) { finded1 = true; }
      })
      let finded2 = false;
      newInstalations.forEach(element2 => {
        if (element.lampId == element2.lamp) { finded2 = true; }
      })
      if (finded1 || !finded2) {
        let newInstalation = {
          lamp: element.lampId,
          location: {
            number: element.location.number,
            zip_code: element.location.zip_code,
            street: element.location.street,
            district: element.location.district,
            state: element.location.state,
          },
          finished: false
        }
        if (typeof element.location.reference != 'undefined') {
          newInstalation.location.reference = element.location.reference;
        }
        if (typeof element.radioId != 'undefined') {
          newInstalation.radioId = element.radioId;
        }
        newInstalations.push(newInstalation);
      }
    })
    service.instalations = newInstalations;
    // Editing corrective maintenances
    let newCorrectiveMaintenances = [];
    service.correctiveMaintenances.forEach(element => {
      if (element.finished == true) {
        newCorrectiveMaintenances.push(element);
      }
    })
    req.body.correctiveMaintenances.forEach(element => {
      let finded1 = false;
      lampsToAssign.forEach(toAssign => {
        if (element == toAssign) { finded1 = true; }
      })
      let finded2 = false;
      newCorrectiveMaintenances.forEach(element2 => {
        if (element == element2.lamp) { finded2 = true; }
      })
      if (finded1 || !finded2) {
        let newCorrectiveMaintenance = {
          lamp: element,
          finished: false
        }
        newCorrectiveMaintenances.push(newCorrectiveMaintenance);
      }
    })
    service.correctiveMaintenances = newCorrectiveMaintenances;
    // Editing preventive maintenances
    let newPreventiveMaintenances = [];
    service.preventiveMaintenances.forEach(element => {
      if (element.finished == true) {
        newPreventiveMaintenances.push(element);
      }
    })
    req.body.preventiveMaintenances.forEach(element => {
      let finded1 = false;
      lampsToAssign.forEach(toAssign => {
        if (element == toAssign) { finded1 = true; }
      })
      let finded2 = false;
      newPreventiveMaintenances.forEach(element2 => {
        if (element == element2.lamp) { finded2 = true; }
      })
      if (finded1 || !finded2) {
        let newPreventiveMaintenance = {
          lamp: element,
          finished: false
        }
        newPreventiveMaintenances.push(newPreventiveMaintenance);
      }
    })
    service.preventiveMaintenances = newPreventiveMaintenances;
    await service.save();
    // Assigning lamps
    for (let index = 0; index < lampsToAssign.length; index++) {
      await Lamp.findByIdAndUpdate(lampsToAssign[index], { serviceAssigned: true });
    }
    // Unassigning lamps
    for (let index = 0; index < lampsToUnassign.length; index++) {
      await Lamp.findByIdAndUpdate(lampsToUnassign[index], { serviceAssigned: false });
    }
    res.status(200).json({ message: 'Service edited successfully.' });
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
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
    // Fetching User responsable for the deleting
    const user = await User.findById(req.userId)
      .catch(err => {
        const error = new Error('Error fetching user.');
        error.statusCode = 500;
        throw error;
      })
    // Saving Deleted Order
    let deletedService = new DeletedService({
      oldId: service.id,
      deletedBy: user,
      user: service.user,
      code: service.code,
      priority: service.priority,
      deadline: service.deadline
    })
    if (typeof service.instalations != 'undefined') {
      for (let index = 0; index < service.instalations.length; index++) {
        // const location = {
        //   number: service.instalations[index].location.number,
        //   zip_code: service.instalations[index].location.zip_code,
        //   street: service.instalations[index].location.street,
        //   district: service.instalations[index].location.district,
        //   state: service.instalations[index].location.state
        // }
        deletedService.instalations.push({
          lamp: service.instalations[index].lamp,
          location: service.instalations[index].location,
          finished: service.instalations[index].finished
        })
        if (typeof service.instalations[index].materialsUsed != 'undefined') {
          deletedService.instalations[index].materialsUsed = service.instalations[index].materialsUsed;
        }
        if (typeof service.instalations[index].finishedDate != 'undefined') {
          deletedService.instalations[index].finishedDate = service.instalations[index].finishedDate;
        }
      }
    }
    if (typeof service.correctiveMaintenances != 'undefined') {
      for (let index = 0; index < service.correctiveMaintenances.length; index++) {
        deletedService.correctiveMaintenances.push({
          lamp: service.correctiveMaintenances[index].lamp,
          finished: service.correctiveMaintenances[index].finished
        })
        if (typeof service.correctiveMaintenances[index].materialsUsed != 'undefined') {
          deletedService.correctiveMaintenances[index].materialsUsed = service.correctiveMaintenances[index].materialsUsed;
        }
        if (typeof service.correctiveMaintenances[index].finishedDate != 'undefined') {
          deletedService.correctiveMaintenances[index].finishedDate = service.correctiveMaintenances[index].finishedDate;
        }
        if (typeof service.correctiveMaintenances[index].newlamp != 'undefined') {
          deletedService.correctiveMaintenances[index].newlamp = service.correctiveMaintenances[index].newlamp;
        }
      }
    }
    if (typeof service.preventiveMaintenances != 'undefined') {
      for (let index = 0; index < service.preventiveMaintenances.length; index++) {
        deletedService.preventiveMaintenances.push({
          lamp: service.preventiveMaintenances[index].lamp,
          finished: service.preventiveMaintenances[index].finished
        })
        if (typeof service.preventiveMaintenances[index].materialsUsed != 'undefined') {
          deletedService.preventiveMaintenances[index].materialsUsed = service.preventiveMaintenances[index].materialsUsed;
        }
        if (typeof service.preventiveMaintenances[index].finishedDate != 'undefined') {
          deletedService.preventiveMaintenances[index].finishedDate = service.preventiveMaintenances[index].finishedDate;
        }
        if (typeof service.preventiveMaintenances[index].newlamp != 'undefined') {
          deletedService.preventiveMaintenances[index].newlamp = service.preventiveMaintenances[index].newlamp;
        }
      }
    }
    if (typeof service.finishedDate != 'undefined') {
      deletedService.finishedDate = service.finishedDate;
    }
    await deletedService.save()
      .catch(err => {
        const error = new Error('Error saving deleted service.');
        error.statusCode = 500;
        throw error;
      });
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
              // CHANGE ME - WARNING !!!
              if (typeof service.instalations[index2].radioId != 'undefined') {
                lamp.radioId = service.instalations[index2].radioId;
              } else {
                lamp.radioId = 1;
              }
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

exports.getDeletedServices = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-deletedServices")
      .catch(err => { throw err; });
    // Fetching Deleted Lamps
    await DeletedService.find()
      .then(deletedServices => {
        res.status(200).json(deletedServices);
      })
      .catch(err => {
        const error = new Error('Error fetching deleted orders.');
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