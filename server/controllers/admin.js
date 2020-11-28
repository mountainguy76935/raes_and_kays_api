const Menu = require('../model/menu.js');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');
const aws = require("aws-sdk");
const jwt = require('jsonwebtoken');

const s3 = new aws.S3();

const MENU_ID = process.env.MENU_ID;

const deleteImage = (oldItems, newItems) => {
    let resourceUrl;
    let index;
    for (let i = 0; i < oldItems.length; i++) {
        index = newItems.findIndex(a => a.image === oldItems[i].image)
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
}

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
                    const token = jwt.sign({
                        userId: user._id.toString()
                    },
                        process.env.JWT_SECRET,
                        { expiresIn: '1hr' }
                    );
                    res.json({
                        token: token,
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
    let user = req.userId;
    User
        .findOne({
            _id: user
        })
        .then(user => {
            if (!user) {
                let error = new Error('wrong credentials');
                error.statusCode = 500
                throw(error)
            }
            let entreeItems = req.body.entreeItems
            let carouselItems = req.body.carouselItems
            let entreeFiles = req.files.entreeImage ? [...req.files.entreeImage] : []
            let carouselFiles = req.files.carouselImage ? [...req.files.carouselImage] : []
            entreeItems = JSON.parse(entreeItems)
            carouselItems = JSON.parse(carouselItems)
            for (let i = 0; i < entreeFiles.length; i++) {
                let index = entreeItems.findIndex(a => a.imageName === entreeFiles[i]['originalname'])
                entreeItems[index]['image'] = entreeFiles[i]['location']
                delete entreeItems[index]['imageName']
            }
            for (let i = 0; i < carouselFiles.length; i++) {
                let index = carouselItems.findIndex(a => a.imageName === carouselFiles[i]['originalname'])
                carouselItems[index]['image'] = carouselFiles[i]['location']
                delete carouselItems[index]['imageName']
            }
            return Menu
                .findOne({ _id: MENU_ID })
                .then(menu => {
                    deleteImage([...menu.entreeItems], entreeItems)
                    deleteImage([...menu.carouselItems], carouselItems)
                    menu.openDates = JSON.parse(req.body.openDates);
                    menu.entreeItems = entreeItems;
                    menu.carouselItems = carouselItems;
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
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}