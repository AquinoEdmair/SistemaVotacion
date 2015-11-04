var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var	RespuestaSchema   = new Schema({
	respuesta: String,
	total: { type: Number, default: 0 },
	pregunta_id: { type : Schema.Types.ObjectId, ref: 'Pregunta' }
});

module.exports = mongoose.model('Respuesta', RespuestaSchema);