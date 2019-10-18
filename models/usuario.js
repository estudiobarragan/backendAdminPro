var moongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = moongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    'nombre': { type: String, required: [true, 'El nombre es obligatorio'] },
    'correo': { type: String, unique: true, required: [true, 'El correo es obligatorio'] },
    'clave': { type: String, required: [true, 'La clave de acceso es obligatorio'] },
    'img': { type: String, required: [false] },
    'role': { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: "El campo {PATH}, debe ser unico" });

module.exports = moongoose.model('Usuario', usuarioSchema);