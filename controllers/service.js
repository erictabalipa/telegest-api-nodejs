const Service = require('../models/service');
const User = require('../models/user');
const Permission = require('../models/permission');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');

// const { validationResult } = require('express-validator');

exports.getServices = async (req, res, next) => {
  try {
    // Permissions check
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "get-services") {
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
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "get-service") {
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
    // Permissions check
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "post-service") {
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
            error.statusCode = 500;
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
    // Creating new service
    let service = new Service({
      user: req.userId,
      lampsInstalled: [],
      lampsRepaired: []
    })
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
        for (let index2 = 0; index2 < req.body.lampsRepaired[index].usersId.length; index2++) {
          lampsRepaired.users.push(req.body.lampsRepaired[index].usersId[index2]);
        }
        service.lampsRepaired.push(lampsRepaired);
      }
    }
    await service.save();
    res.status(201).json({ message: 'Service created.' });


    // Address all lamps requested
    // if (typeof req.body.lampsInstalled != 'undefined') {
    //   if (req.body.lampsInstalled.length > 0) {
    //     for (let i=0; i < req.body.lampsInstalled.length; i++) {
    //       let location;
    //       if (typeof req.body.lampsInstalled[i].location.reference != 'undefined') {
    //         location = new Location({
    //           number: req.body.lampsInstalled[i].location.number,
    //           zip_code: req.body.lampsInstalled[i].location.zip_code,
    //           street: req.body.lampsInstalled[i].location.street,
    //           district: req.body.lampsInstalled[i].location.district,
    //           state: req.body.lampsInstalled[i].location.state,
    //           reference: req.body.lampsInstalled[i].location.reference
    //         })
    //       } else {
    //         location = new Location({
    //           number: req.body.lampsInstalled[i].location.number,
    //           zip_code: req.body.lampsInstalled[i].location.zip_code,
    //           street: req.body.lampsInstalled[i].location.street,
    //           district: req.body.lampsInstalled[i].location.district,
    //           state: req.body.lampsInstalled[i].location.state
    //         })
    //       }
    //       const result = await location.save();
    //       let lamp = await Lamp.findById(req.body.lampsInstalled[i].lampId);
    //       if (typeof lamp.location != 'undefined') {
    //         await Location.findByIdAndDelete(lamp.location);
    //       }
    //       lamp.location = result._id;
    //       await lamp.save();
    //     }
    //   }
    // }
    // Saving the service
    // let service = new Service({
    //   user: req.body.userId,
    //   date: req.body.date
    // })
    // if (typeof req.body.lampsInstalled != 'undefined') {
    //   if (req.body.lampsInstalled.length > 0) {
    //     for (let i=0; i < req.body.lampsInstalled.length; i++) {
    //       service.lampsInstalled[i] = req.body.lampsInstalled[i].lampId;
    //     }
    //   }
    // }
    // if (typeof req.body.lampsRepaired != 'undefined') {
    //   if (req.body.lampsRepaired.length > 0) {
    //     for (let i=0; i < req.body.lampsRepaired.length; i++) {
    //       service.lampsRepaired[i] = req.body.lampsRepaired[i].lampId;
    //     }
    //   }
    // }
    // await service.save();
    // res.status(201).json({ message: 'Service created.' });
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
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "delete-service") {
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
    const service = await Service.findById(req.params.id);
    if (service == null) {
      const error = new Error('Service not found.');
      error.statusCode = 404;
      throw error;
    }
    await service.delete();
    res.status(200).json({ message: 'Service deleted successfully.' });
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
    let checkPermission = true;
    await Permission.findById(req.permissions)
      .then(perms => {
        perms.permissions.forEach(perm => {
          if (perm == "complete-service") {
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
    // Check if order exist
    const service = await Service.findById(req.body.orderId);
    if (service == null) {
      const error = new Error('Service not found.');
      error.statusCode = 404;
      throw error;
    }
    // Check if service exist
    for (let index = 0; index < req.body.servicesId.length; index++) {
      let exists = false;
      if (service.lampsInstalled.length > 0) {
        for (let index2 = 0; index2 < service.lampsInstalled.length; index2++) {
          if (service.lampsInstalled[index2]._id == req.body.servicesId[index]) {
            exists = true;
            break;
          }
        }
      }
      if (service.lampsRepaired.length > 0) {
        for (let index2 = 0; index2 < service.lampsRepaired.length; index2++) {
          if (service.lampsRepaired[index2]._id == req.body.servicesId[index]) {
            exists = true;
            break;
          }
        }
      }
      if (exists = false) {
        const error = new Error('Service not found.');
        error.statusCode = 404;
        throw error;
      }
    }
    // Finishing services
    for (let index = 0; index < req.body.servicesId.length; index++) {
      if (service.lampsInstalled.length > 0) {
        for (let index2 = 0; index2 < service.lampsInstalled.length; index2++) {
          if (service.lampsInstalled[index2]._id == req.body.servicesId[index]) {
            service.lampsInstalled[index2].finished = true;
            service.lampsInstalled[index2].finishedDate = new Date();
            break;
          }
        }
      }
      if (service.lampsRepaired.length > 0) {
        for (let index2 = 0; index2 < service.lampsRepaired.length; index2++) {
          if (service.lampsRepaired[index2]._id == req.body.servicesId[index]) {
            service.lampsRepaired[index2].finished = true;
            service.lampsRepaired[index2].finishedDate = new Date();
            break;
          }
        }
      }
    }
    let all_done = true;
    if (service.lampsInstalled.length > 0) {
      for (let index2 = 0; index2 < service.lampsInstalled.length; index2++) {
        if (service.lampsInstalled[index2].finished == false) {
          all_done = false;
          break;
        }
      }
    }
    if (service.lampsRepaired.length > 0) {
      for (let index2 = 0; index2 < service.lampsRepaired.length; index2++) {
        if (service.lampsRepaired[index2].finished == false) {
          all_done = false;
          break;
        }
      }
    }
    if (all_done == true) {
      service.finishedDate = new Date();
    }
    await service.save();

    // Update Lamps
    for (let index = 0; index < req.body.servicesId.length; index++) {
      if (service.lampsInstalled.length > 0) {
        for (let index2 = 0; index2 < service.lampsInstalled.length; index2++) {
          if (req.body.servicesId[index] == service.lampsInstalled[index2]._id) {
            const location = new Location({
              number: service.lampsInstalled[index2].location.number,
              zip_code: service.lampsInstalled[index2].location.zip_code,
              street: service.lampsInstalled[index2].location.street,
              district: service.lampsInstalled[index2].location.district,
              state: service.lampsInstalled[index2].location.state
            })
            if (typeof service.lampsInstalled[index2].location.reference != 'undefined') {
              location.reference = service.lampsInstalled[index2].location.reference;
            }
            const result = await location.save();
            const lamp = await Lamp.findById(service.lampsInstalled[index2].lamp);
            lamp.location = result._id;
            lamp.online = true;
            await lamp.save();
          }
        }
      }
      if (service.lampsRepaired.length > 0) {
        for (let index2 = 0; index2 < service.lampsRepaired.length; index2++) {
          if (req.body.servicesId[index] == service.lampsRepaired[index2]._id) {
            const lamp = await Lamp.findById(service.lampsRepaired[index2].oldLamp);
            const lamp2 = await Lamp.findById(service.lampsRepaired[index2].newLamp);
            lamp2.location = lamp.location;
            lamp2.online = true;
            lamp.location = undefined;
            lamp.online = false;
            await lamp2.save();
            await lamp.save();
          }
        }
      }
    }
    res.status(200).json({ message: 'Service updated successfully.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};