const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://' + "telegestao" + ':' + "telegestao_tcc" + '@cluster0.izanfqg.mongodb.net/' + "tcc";

const authRoutes = require('./routes/auth');
const lampRoutes = require('./routes/lamp');
const modelRoutes = require('./routes/model');
const servRoutes = require('./routes/service');
const changeRoutes = require('./routes/changelog');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', ' Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(authRoutes);
app.use(lampRoutes);
app.use(modelRoutes);
app.use(servRoutes);
app.use(changeRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));