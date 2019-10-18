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

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
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