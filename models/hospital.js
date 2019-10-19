var moongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = moongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El id del usuario es un campo obligatorio'] }
}, { collection: 'hospitales' });

module.exports = moongoose.model('Hospital', hospitalSchema);