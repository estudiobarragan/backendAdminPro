'use strict'
'use esversion: 6 '

var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

/* 

    Obtener todos los usuarios

*/
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre correo img role')
        .exec(
            (err, usuario) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: 'Error cargando DB ',
                        errors: err
                    });
                }
                return res.status(200).send({
                    ok: true,
                    usuario: usuario
                })
            });

});

/* 
 
    Actualizar un usuario

*/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).send({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: { message: "No existe un usuario con dicho Id en la DB" }
            });
        }

        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role;

        usuario.save((err, usuarioGrabado) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuarioGrabado.clave = ';-)';
            return res.status(200).send({
                ok: true,
                usuario: usuarioGrabado,
                usuarioToken: req.usuario
            });
        })
    })
})

/* 
 
    Crear un usuario

*/
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    /* var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync("B4c0/\/", salt); */
    console.log(req);
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        clave: bcrypt.hashSync(body.clave, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGrabado) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }
        usuarioGrabado.clave = ';-)';
        return res.status(201).send({
            ok: true,
            usuario: usuario,
            usuarioToken: req.usuario
        })
    })

});

/* 
 
    Borrar un usuario

*/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: { message: 'Fallo en el acceso a la DB.' }
            });
        }
        if (!usuarioBorrado) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        usuarioBorrado.clave = ';-)';
        return res.status(200).send({
            ok: true,
            usuario_borrado: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });
});

module.exports = app;