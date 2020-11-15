const express = require('express');
const router = express.Router()
const adminController = require('../controllers/admin')

router.post('/login', adminController.postLogin)

router.get('/menu', adminController.getMenu)

router.post('/post-menu', adminController.postMenu)

module.exports = router