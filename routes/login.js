'use strict'

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

var app = express();
var Usuario = require('../models/usuario');


/* 
Autenticacion google
*/
app.post('/google', (req, res) => {
    var { OAuth2Client } = require('google-auth-library');
    var client = new OAuth2Client(GOOGLE_CLIENT_ID);
    var token = req.body.token || '';

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        //const domain = payload['hd'];

        // Cargar el usuario en nuestra DB sino existe
        Usuario.findOne({ correo: payload.email }, (err, usuario) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    mensaje: 'Error al buscar usuario - login',
                    error: err
                });
            }
            // Si el cliente no esta en la DB, se lo ingresa a la misma
            if (!usuario) {

                var usuarioN = new Usuario({
                    nombre: payload.name,
                    correo: payload.email,
                    clave: ';-)',
                    img: payload.picture,
                    google: true
                        // role: payload.role que tome el default
                });

                usuarioN.save((err, usuarioDB) => {
                    if (err || !usuarioDB) {
                        return res.status(500).send({
                            ok: false,
                            mensaje: 'Error al grabar el usuario en la DB',
                            error: err
                        });
                    }

                    // Crear un token
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

                    return res.status(200).send({
                        ok: true,
                        message: 'Usuario google, dado de alta en la DB',
                        usuario: usuarioDB,
                        token
                    });
                });
            } else {
                // Si el usuario existe y tiene cuenta No Google

                if (!usuario.google) {
                    return res.status(400).send({
                        ok: false,
                        mensaje: 'Debe usar su autentificación habitual, no por google'
                    });
                } else {
                    // Si el usuario existe y es un usuario Google e ingreso por aca

                    // Crear un token
                    usuario.clave = ':-;';
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //4 horas

                    return res.status(200).send({
                        ok: true,
                        message: 'Usuario google autorizado su ingreso.',
                        usuario: usuario,
                        token
                    });
                }
            }
        });

    }
    verify().catch(error => {
        return res.status(400).send({
            ok: false,
            mensaje: 'Ingreso no autorizado by Google',
            error: error
        });
    });

});


/* 
    Autenticacion nornal
*/

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