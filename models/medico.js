var moongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = moongoose.Schema;

var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El id del usuario es un campo obligatorio'] },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id del hospital es un campo obligatorio'] }
});

module.exports = moongoose.model('Medico', medicoSchema);