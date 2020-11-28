const express = require('express');
const router = express.Router()
const adminController = require('../controllers/admin')
const isAuth = require('../util/auth.js')

router.post('/login', adminController.postLogin)

router.get('/menu', adminController.getMenu)

router.post('/post-menu', isAuth, adminController.postMenu)

module.exports = router