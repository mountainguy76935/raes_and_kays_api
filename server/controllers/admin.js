const Menu = require('../model/menu');
const User = require('../model/user');
const bcrypt = require('bcrypt');

exports.postLogin = (req, res, next) => {
    let password = req.body.password;
    let username = req.body.username;
    User
        .findOne({
            username: username
        })
        .then(user => {
            if (!user) {
                const error = new Error("User doesn't exist. Please double check username/email!");
                error.statusCode = 401;
                throw error
            }
            bcrypt
                .compare(password, user.password)
                .then(match => {
                    if (!match) {
                        const error = new Error("Username/email and password don't match");
                        error.statusCode = 401;
                        throw error
                    }
                    res.json({
                        success: true
                    })
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500
                    }
                    next(err)
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.getMenu = (req, res, next) => {
    return
}