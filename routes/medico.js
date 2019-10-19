'use strict'
'use esversion: 6 '

var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

/* 

    Obtener todos los medico

*/
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre usuario img hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo role')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: 'Error cargando DB ',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                if (err || conteo === undefined || conteo === null) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando conteo de registros de la DB ',
                        errors: err
                    });
                }
                return res.status(200).send({
                    ok: true,
                    medico: medico,
                    total: conteo
                });
            });
        });

});

/* 
 
    Actualizar un medico

*/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(body.hospital, (err, hospitalDB) => {
        if (err || !hospitalDB) {
            return res.status(400).send({
                ok: false,
                mensaje: 'No existe el hospital indicado',
                errors: err,
                id_Hospital: body.hospital
            });
        }
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: 'Error al buscar el medico',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).send({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ', no existe.',
                    errors: { message: "No existe un medico con dicho Id en la DB" }
                });
            }

            medico.nombre = body.nombre;
            medico.usuario = req.usuario;
            medico.hospital = hospitalDB;

            medico.save((err, medicoGrabado) => {
                if (err) {
                    return res.status(400).send({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    });
                }

                return res.status(200).send({
                    ok: true,
                    medico: medico,
                    hospital: hospitalDB,
                    Usuario_Habilitante: req.usuario
                });
            });
        });
    });
});

/* 
 
    Crear un medico

*/
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    /* console.log(req); */
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario,
        hospital: body.hospital
    });

    Hospital.findById(body.hospital, (err, hospitalDB) => {
        if (err || !hospitalDB) {
            return res.status(400).send({
                ok: false,
                mensaje: 'No existe el hospital indicado',
                errors: err,
                id_Hospital: body.hospital
            });
        }
        medico.save((err, medicoGrabado) => {
            if (err || !medicoGrabado) {
                return res.status(400).send({
                    ok: false,
                    mensaje: 'Error al crear el medico',
                    errors: err
                });
            }

            return res.status(201).send({
                ok: true,
                medico: medico,
                hospital: hospitalDB,
                Usuario_Habilitante: req.usuario
            })
        })
    });
});

/* 
 
    Borrar un Medico

*/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: { message: 'Fallo en el acceso a la DB.' }
            });
        }
        if (!medicoBorrado) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        return res.status(200).send({
            ok: true,
            medico_borrado: medicoBorrado,
            Usuario_Habilitante: req.usuario
        });
    });
});

module.exports = app;