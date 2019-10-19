'use strict'

/* var app = require('./app');
var port = process.env.PORT || 3000; */

// requires
var express = require('express');
const mongoose = require("mongoose");
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongo cloud
const port = process.env.PORT || 3000;
const MC_url = "mongodb+srv://pablo:pablo@data-odwhn.mongodb.net/hospitalDB";

/*  
    Server index config 
    permite habilitar acceso a la carpeta de imagenes subidas en el servidor
    <direccion server>/uploads
    Ver si vale la pena habilitar esto. Si se necesita ver otra carpeta cambiar esto en 
    la tercera linea.

    Temporalmente desabilitado
*/
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');


app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


mongoose.Promise = global.Promise;
mongoose.connect(MC_url, {
        'useNewUrlParser': true,
        'useFindAndModify': false,
        'useUnifiedTopology': true
    })
    .then(() => {
        console.log('\n'.repeat(50));
        console.log('Conexiôn a Cloud MongoDb: \x1b[32m%s\x1b[0m', 'online');

        // Escuchar peticiones
        app.listen(port, () => {
            console.log('Express server en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
        });
    })
    .catch((error) => console.log('Error al abrir la base de datos', error));