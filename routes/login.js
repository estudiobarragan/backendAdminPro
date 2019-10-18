'use strict'

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ correo: body.correo }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).send({
                ok: false,
                mensaje: 'Login incorrecto.',
                errors: { message: "# No existe un usuario con ese correo electronico" }
            });
        }

        if (!bcrypt.compareSync(body.clave, usuarioDB.clave)) {
            return res.status(400).send({
                ok: false,
                mensaje: 'Login incorrecto.',
                errors: { message: "# La clave es incorrecta" }
            });
        }
        // La clave no se integra al token del usuario
        usuarioDB.clave = ':-;';

        // Crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        return res.status(200).send({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB.id
        });
    })

});


module.exports = app;