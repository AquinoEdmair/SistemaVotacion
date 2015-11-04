var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var	PreguntaSchema   = new Schema({
	pregunta: String,
	total: { type: Number, default: 0 },
	respuestas_id: [{ type: Schema.Types.ObjectId, ref: 'Respuesta' }]
});

module.exports = mongoose.model('Pregunta', PreguntaSchema);