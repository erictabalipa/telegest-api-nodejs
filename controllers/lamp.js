// const { validationResult } = require('express-validator');

const Service = require('../models/service');
const User = require('../models/user');
const Permission = require('../models/permission');
const Lamp = require('../models/lamp');
const Model = require('../models/model');
const Location = require('../models/location');

function checkRequest(req) {
    if (typeof req.body === 'undefined') {
        const error = {
            message: 'Request body is empty.',
            statusCode: 400
        }
        return error;
    }
    if (typeof req.body.name === 'undefined' ||
        typeof req.body.model === 'undefined' ||
        typeof req.body.model.name === 'undefined' ||
        typeof req.body.model.fabricator === 'undefined' ||
        typeof req.body.model.fabrication_date === 'undefined' ||
        typeof req.body.model.life_time === 'undefined') {
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
        const lampId = req.params.lampId;
        let lamp;
        await Lamp.findById(lampId)
            .then(lampData => {
                lamp = lampData;
            })
            .catch(err => {
                const error = new Error('Error finding lamp in database.');
                error.statusCode = 500;
                throw error;
            })
        
        await Model.findById(lamp.model)
            .then(model => {
                lamp = {...lamp._doc, model: model};
            })
            .catch(err => {
                const error = new Error('Error finding lamp model in database.');
                error.statusCode = 500;
                throw error;
            })
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
        // Checking if the requist is OK
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

        // If the model not exist -> Create a new one
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

        // Create the new lamp
        const lamp = new Lamp({
            name: req.body.name,
            model: modelId
        })
        await lamp.save()
            .then(result => {
                res.status(201).json({ message: 'Lamp created.', lampId: result._id });
            }).catch(err => {
                const error = new Error('Error saving lamp in database');
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

exports.editLamp = async (req, res, next) => {
    try {
        const lampId = req.params.lampId;
        let lamp;
        await Lamp.findById(lampId)
            .then(lampData => {
                lamp = lampData;
            })
            .catch(err => {
                const error = new Error('Error finding lamp in database.');
                error.statusCode = 500;
                throw error;
            })
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
                        location.reference = "";
                    }
                    location.save();
                })
                .catch(err => {
                    const error = new Error('Error finding lamps location in database.');
                    error.statusCode = 500;
                    throw error;
                });
        }
        lamp.name = req.body.name;
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
        await lamp.save()
            .then(result => {
                res.status(201).json({ message: 'Lamp updated.', lampId: result._id });
            }).catch(err => {
                const error = new Error('Error saving lamp in database');
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

exports.deleteLamp = async (req, res, next) => {
    try {
        const lampId = req.params.lampId;
        let lamp;
        let deleteModel = false;
        let deleteLocation = false;
        await Lamp.findById(lampId)
            .then(lampData => {
                lamp = lampData;
            })
            .catch(err => {
                const error = new Error('Error finding lamp in database');
                error.statusCode = 500;
                throw error;
            })
        await Lamp.where('model').equals(lamp.model)
            .then(lamps => {
                if (lamps.length < 2) {
                    deleteModel = true;
                }
            })
            .catch(err => {
                const error = new Error('Error finding lamp model in database');
                error.statusCode = 500;
                throw error;
            })
        if (typeof lamp.location != 'undefined') {
            deleteLocation = true;
        }
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
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};