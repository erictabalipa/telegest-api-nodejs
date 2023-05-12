const ChangeLog = require('../models/changeLog');
const ErrorLog = require('../models/errorLog');

const { checkPermission } = require('../utils/aux_functions');

exports.getChanges = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-changes")
      .catch(err => { throw err; });
    // Fetching Changes
    await ChangeLog.find()
      .then(changes => {
        res.status(200).json(changes);
      })
      .catch(err => {
        const error = new Error('Error fetching changes.');
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

exports.getErrors = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-errors")
      .catch(err => { throw err; });
    // Fetching Changes
    await ErrorLog.find()
      .then(errors => {
        res.status(200).json(errors);
      })
      .catch(err => {
        const error = new Error('Error fetching errors.');
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