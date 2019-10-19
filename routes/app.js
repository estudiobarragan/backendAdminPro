'use strict'

var express = require('express');
var app = express();


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).send({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
});

module.exports = app;