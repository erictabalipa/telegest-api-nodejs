const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Permission = require('../models/permission');
const User = require('../models/user');

// const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
        const permissionId = req.body.permission;
        const hashedPw = await bcrypt.hash(password, 12);
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            const error = new Error('Permission not found.');
            error.statusCode = 401;
            throw error;
        }
        const user = new User({
            email: email,
            password: hashedPw,
            name: name,
            permission: permission
        })
        const result = await user.save();
        res.status(201).json({ message: 'User created.', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Incorrect password, please try again.');
            error.statusCode = 401;
            throw error;
        }
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
}

exports.getPermissions = async (req, res, next) => {
    try {
        const token = req.params.token;
        let decodedToken;
        decodedToken = jwt.verify(
            token,
            "nobody's gonna know, nobody's gonna know - they gonna know! - who will they know?, who will they know?, who will they know? - I can't, I can't, I just, I can't - omg!"
        );
        if (!decodedToken) {
            const error = new Error('Invalid token.');
            error.statusCode = 400;
            throw error;
        }
        const permission = await Permission.findById(decodedToken.permission);
        res.status(200).json({ name: decodedToken.name , email: decodedToken.email, permissions: permission.permissions });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}