'use strict'

var express = require('express');
var fs = require('fs');

var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');

// Rutas
app.get('/:tipo/:img', mdAutenticacion.verificaToken, (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${tipo}/${img}`;
    /* 
        console.log('tipo:', tipo, '\nimg:', img, '\npath:', path); */
    fs.exists(path, existe => {
        if (!existe) {
            path = './assets/no-img.jpg';
        }
        res.sendfile(path);
    });

    /* res.status(200).send({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    }) */
});

module.exports = app;