const Service = require('../models/service');
const User = require('../models/user');
const Permission = require('../models/permission');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');

// const { validationResult } = require('express-validator');

function checkRequest(req) {
    if (typeof req.body === 'undefined') {
        const error = {
            message: 'Request body is empty.',
            statusCode: 400
        }
        return error;
    }
    if (typeof req.body.userId === 'undefined' ||
        typeof req.body.lampsInstalled === 'undefined' ||
        typeof req.body.lampsRepaired === 'undefined' ||
        typeof req.body.date === 'undefined') {
        const error = {
            message: 'Missing data in the request.',
            statusCode: 400
        }
        return error;
    }
    return null;
};

exports.postService = async (req, res, next) => {
    try {
        // Checking if the request is OK
        const reqError = checkRequest(req);
        if (reqError) {
            const error = new Error(reqError.message);
            error.statusCode = reqError.statusCode;
            throw error;
        }
        // Checking if the user exists
        let user = null;
        await User.findById(req.body.userId)
            .then(userData => {
                if (userData != null) {
                    user = userData;
                }
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

        // Address all lamps requested
        if (typeof req.body.lampsInstalled != 'undefined') {
            if (req.body.lampsInstalled.length > 0) {
                for (let i=0; i < req.body.lampsInstalled.length; i++) {
                    let location;
                    if (typeof req.body.lampsInstalled[i].location.reference != 'undefined') {
                        location = new Location({
                            number: req.body.lampsInstalled[i].location.number,
                            zip_code: req.body.lampsInstalled[i].location.zip_code,
                            street: req.body.lampsInstalled[i].location.street,
                            district: req.body.lampsInstalled[i].location.district,
                            state: req.body.lampsInstalled[i].location.state,
                            reference: req.body.lampsInstalled[i].location.reference
                        })
                    } else {
                        location = new Location({
                            number: req.body.lampsInstalled[i].location.number,
                            zip_code: req.body.lampsInstalled[i].location.zip_code,
                            street: req.body.lampsInstalled[i].location.street,
                            district: req.body.lampsInstalled[i].location.district,
                            state: req.body.lampsInstalled[i].location.state
                        })
                    }
                    const result = await location.save();
                    let lamp = await Lamp.findById(req.body.lampsInstalled[i].lampId);
                    if (typeof lamp.location != 'undefined') {
                        await Location.findByIdAndDelete(lamp.location);
                    }
                    lamp.location = result._id;
                    await lamp.save();
                }
            }
        }

        // Saving the service
        let service = new Service({
            user: req.body.userId,
            date: req.body.date
        })
        if (typeof req.body.lampsInstalled != 'undefined') {
            if (req.body.lampsInstalled.length > 0) {
                for (let i=0; i < req.body.lampsInstalled.length; i++) {
                    service.lampsInstalled[i] = req.body.lampsInstalled[i].lampId;
                }
            }
        }
        if (typeof req.body.lampsRepaired != 'undefined') {
            if (req.body.lampsRepaired.length > 0) {
                for (let i=0; i < req.body.lampsRepaired.length; i++) {
                    service.lampsRepaired[i] = req.body.lampsRepaired[i].lampId;
                }
            }
        }
        await service.save();
        res.status(201).json({ message: 'Service created.' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};