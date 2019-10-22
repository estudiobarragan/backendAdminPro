'use strict'

var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


/* 
    Busqueda por coleccion
*/
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla.toLowerCase();

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            res.status(400).send({
                ok: false,
                mensaje: 'Tabla mal indicada',
                error: { message: 'Los tipos de tabla solo pueden ser: usuarios, medicos u hospitales' }
            });
    };

    if (promesa) {
        promesa.then(respuestas => {
            res.status(200).send({
                ok: true,
                [tabla]: respuestas
            });
        });
    }
});

/* 
    Busqueda general
 */
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).send({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre correo img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al buscar hospitales: ', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre correo img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al buscar Medicos: ', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre correo rol img')
            .or([{ 'nombre': regex }, { 'correo': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar usuarios: ', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;