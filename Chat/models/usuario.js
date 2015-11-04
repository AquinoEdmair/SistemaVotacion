var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var	UsuarioSchema   = new Schema({
	nombre: String,
	email: String,
	password: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);