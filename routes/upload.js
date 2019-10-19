'use strict'

var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

/*  
    upload imagenes en general
*/
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo.toLowerCase();
    var id = req.params.id;

    if (!req.files) {
        res.status(400).send({
            ok: false,
            mensaje: 'No hay seleccionado ningun archivo',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Validacion de tipo
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).send({
            ok: false,
            mensaje: 'El tipo de colección ( ' + tipo + ' ) asignado no es válida.',
            errors: { message: 'Los tipos válidos de coleccion son: ' + tiposValidos.join(' ') }
        });
    }


    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones son válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).send({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'LAs extensiones validas son: ' + extensionesValidas.join(' ') }
        });
    }

    // Crear nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo al folder correspondiente
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            res.status(500).send({
                ok: false,
                mensaje: 'Error al mover el archivo.',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res, archivo);
    });

});

function subirPorTipo(tipo, id, nombreArchivo, res, archivo) {
    switch (tipo) {
        case 'usuarios':
            var Modelo = Usuario;
            var nombre = 'usuario';
            var folder = 'usuarios';
            break;
        case 'medicos':
            var Modelo = Medico;
            var nombre = 'medico';
            var folder = 'medicos';
            break;
        case 'hospitales':
            var Modelo = Hospital;
            var nombre = 'hospital';
            var folder = 'hospitales';
            break;
        default:
            return res.status(500).send({
                ok: false,
                mensaje: `Error inesperado por coleccion inexistente.`,
                coleccion: tipo,
                errors: err
            });
    }


    Modelo.findById(id, (err, registro) => {
        if (err || !registro) {
            return res.status(500).send({
                ok: false,
                mensaje: `Error al buscar el ${nombre} a actualizar.`,
                errors: err
            });
        }

        // Si tenia un archivo asignado, borra el archvio anterior
        var pathViejo = `./uploads/${folder}/${registro.img}`;

        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, (err) => {
                if (err) {
                    return res.status(500).send({
                        ok: false,
                        mensaje: `Error al procurar borrar la imagen previa del ${nombre} en la DB.`,
                        archivo: pathViejo,
                        errors: err
                    });
                }
            });
        }

        // Actualiza el registro
        registro.img = nombreArchivo;
        registro.save((err, registroActualizado) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: `Error al actualizar la imagen del ${nombre} en la DB.`,
                    errors: err
                });
            }
            // TODO clave solo tienen los usuarios 
            registroActualizado.clave = ';-)';
            return res.status(200).send({
                ok: true,
                mensaje: `Imagen de ${nombre} actualizada`,
                usuario: registroActualizado,
                [tipo]: archivo.name
            });
        })

    });
}

module.exports = app;