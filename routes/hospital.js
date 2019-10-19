'use strict'
'use esversion: 6 '

var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');

/* 

    Obtener todos los hospitales

*/
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo role')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: 'Error cargando DB ',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                if (err || conteo === undefined || conteo === null) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando conteo de registros de la DB ',
                        errors: err
                    });
                }
                return res.status(200).send({
                    ok: true,
                    hospital: hospital,
                    total: conteo
                });
            });
        });

});

/* 
 
    Actualizar un hospital

*/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).send({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ', no existe.',
                errors: { message: "No existe un hospital con dicho Id en la DB" }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario;

        hospital.save((err, hospitalGrabado) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            return res.status(200).send({
                ok: true,
                hospital: hospitalGrabado,
                Usuario_Habilitante: req.usuario
            });
        })
    })
})

/* 
 
    Crear un hospital

*/
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    /* console.log(req); */
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario
    });

    hospital.save((err, hospitalGrabado) => {
        if (err || !hospitalGrabado) {
            return res.status(400).send({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        return res.status(201).send({
            ok: true,
            hospital: hospital,
            Usuario_Habilitante: req.usuario
        })
    })

});

/* 
 
    Borrar un hospital

*/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: { message: 'Fallo en el acceso a la DB.' }
            });
        }
        if (!hospitalBorrado) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        return res.status(200).send({
            ok: true,
            hospital_borrado: hospitalBorrado,
            Usuario_Habilitante: req.usuario
        });
    });
});

module.exports = app;