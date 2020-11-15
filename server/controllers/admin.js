const Menu = require('../model/menu.js');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');
const aws = require("aws-sdk");

const s3 = new aws.S3();
const ObjectId = require('mongodb').ObjectID;

const MENU_ID = process.env.MENU_ID;

exports.postLogin = (req, res, next) => {
    let password = req.body.password;
    let username = req.body.username;
    User
        .findOne({ username: username })
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
    return Menu
        .findOne({ _id: MENU_ID })
        .then(menu => {
            res.send({
                data: menu,
                success: true
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.postMenu = (req, res, next) => {
    if (!req.files) {
        imageUrl = 'none';
    } else {
        imageUrl = req.files.location;
    }
    let entreeItems = req.body.entreeItems
    entreeItems = JSON.parse(entreeItems)
    for (let i = 0; i < req.files.length; i++) {
        let index = entreeItems.findIndex(a => a.imageName === req.files[i]['originalname'])
        entreeItems[index]['image'] = req.files[i]['location']
        delete entreeItems[index]['imageName']
    }
    return Menu
        .findOne({ _id: MENU_ID })
        .then(menu => {
            let oldItems = [...menu.entreeItems]
            let resourceUrl;
            let index;
            for (let i = 0; i < oldItems.length; i++) {
                index = entreeItems.findIndex(a => a.image === oldItems[i].image)
                if (index < 0) {
                    resourceUrl = oldItems[i]['image'].split('/').slice(-1)[0];
                    const params = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: resourceUrl
                    }
                    s3.deleteObject(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        } else {
                            console.log(data);
                        }
                    })
                }
            }
            menu.openDates = JSON.parse(req.body.openDates);
            menu.entreeItems = entreeItems;
            menu.sideItems = JSON.parse(req.body.sideItems);
            menu.price = req.body.price;
            menu.description = req.body.description;
            menu.popup = JSON.parse(req.body.popup);
            menu.disclaimer = req.body.disclaimer;
            menu
                .save()
                .then(() => {
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