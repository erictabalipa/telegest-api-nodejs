const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { ObjectId } = require('mongodb');
const Permission = require('../models/permission');
const User = require('../models/user');

const { checkPermission } = require('../utils/aux_functions');

exports.getUsers = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-users")
      .catch(err => { throw err; });
    // Fetching Users
    await User.find()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => {
        const error = new Error('Error fetching users.');
        error.statusCode = 500;
        throw error;
      })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.getUser = async (req, res, next) => {
  try {
    // Permissions check
    await checkPermission(req.permissions, "get-users")
      .catch(err => { throw err; });
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fetching Users
    const user = await User.findById(req.params.id)
      .catch(err => {
        const error = new Error('Error fetching users.');
        error.statusCode = 500;
        throw error;
      })
    if (user == null) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(user);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.signup = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fecthing Permissions and hash Password
    const hashedPw = await bcrypt.hash(req.body.password, 12);
    const permission = await Permission.findById(req.body.permission);
    if (!permission) {
      const error = new Error('Permission not found.');
      error.statusCode = 401;
      throw error;
    }
    // Creating New User
    const user = new User({
      email: req.body.email,
      password: hashedPw,
      name: req.body.name,
      permission: permission
    })
    // Saving New User
    const result = await user.save();
    res.status(201).json({ message: 'User created.', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Fecthing User
    const user = await User.findOne({ email: req.body.email });
    if (user == null) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    // Checking Password
    const isEqual = await bcrypt.compare(req.body.password, user.password);
    if (!isEqual) {
      const error = new Error('Incorrect password, please try again.');
      error.statusCode = 400;
      throw error;
    }
    // Generating Token
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        userId: user._id.toString(),
        permission: user.permission
      },
      "nobody's gonna know, nobody's gonna know - they gonna know! - who will they know?, who will they know?, who will they know? - I can't, I can't, I just, I can't - omg!",
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPermissions = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking Token
    let decodedToken = jwt.verify(
      req.params.token,
      "nobody's gonna know, nobody's gonna know - they gonna know! - who will they know?, who will they know?, who will they know? - I can't, I can't, I just, I can't - omg!"
    );
    if (!decodedToken) {
      const error = new Error('Invalid token.');
      error.statusCode = 400;
      throw error;
    }
    const permission = await Permission.findById(decodedToken.permission);
    if (permission == null) {
      const error = new Error('Permissions not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ name: decodedToken.name , email: decodedToken.email, permissions: permission.permissions });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editUser = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking if the user to be edited is himself
    if (req.params.id != req.userId) {
      const error = new Error('Only the user himself can change his data.');
      error.statusCode = 401;
      throw error;
    }
    // Checking if user exists
    const user = await User.findById(req.params.id)
      .catch(err => {
        const error = new Error('Error fetching users.');
        error.statusCode = 500;
        throw error;
      })
    if (user == null) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    // Verifying that the email is not in use
    const userWithEmail = await User.findOne({ email: req.body.email });
    if (userWithEmail != null && userWithEmail._id != req.params.id) {
      const error = new Error('There is already a user with this email.');
      error.statusCode = 409;
      throw error;
    }
    // Updating user
    await User.updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: { name: req.body.name, email: req.body.email }
    }).catch(err => {
      const error = new Error('Error updating user.');
      error.statusCode = 500;
      throw error;
    });
    res.status(200).json({ message: 'User successfully updated.' });
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
    next(err);
  }
};

exports.editPassword = async (req, res, next) => {
  try {
    // Checking the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Invalid data.');
      error.statusCode = 400;
      error.data = errors.array();
      throw error;
    }
    // Checking if user exists
    const user = await User.findById(req.body.userId)
      .catch(err => {
        const error = new Error('Error fetching users.');
        error.statusCode = 500;
        throw error;
      })
    if (user == null) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    // Updating password
    const hashedPw = await bcrypt.hash(req.body.password, 12);
    await User.updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: { password: hashedPw }
    }).catch(err => {
      const error = new Error('Error updating user.');
      error.statusCode = 500;
      throw error;
    });
    res.status(200).json({ message: 'Password successfully updated.' });
  } catch (err) {
    if (!err.statusCode) { err.statusCode = 500; }
    next(err);
  }
};