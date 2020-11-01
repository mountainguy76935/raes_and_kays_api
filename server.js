require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const adminRoutes = require('./server/routes/admin');

const app = express();

const port = process.env.port || 4000
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
const MONGO_USER = process.env.MONGO_USER
const MONGO_CLUSTER = process.env.MONGO_CLUSTER
const DB_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`

mongoose.set('useFindAndModify', false);

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.set({
        'Content-Security-Policy': "script-src 'self', frame-ancestors 'none', X-Content-Type-Options 'nosniff'"
    })
    res.setHeader('Access-Control-Allow-Origin', process.env.APPROVED_URL)
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(adminRoutes)

app.use((error, req, res, next) => {
    console.log('Error: ', error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message })
})

mongoose.connect(
    DB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => app.listen(port))
    .then(() => console.log('connected to port ' + port))
    .catch(err => console.log(err))
