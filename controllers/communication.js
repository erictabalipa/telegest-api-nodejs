const { validationResult } = require('express-validator');
const { saveNewDimerize } = require('../utils/communication');
const { checkPermission } = require('../utils/aux_functions');

exports.postDimming = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "post-dimming");
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    await saveNewDimerize(req.body.radioId, req.body.percentage);
    res.status(200).json({ message: 'Sucesso' });
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
    next(err);
  };
};