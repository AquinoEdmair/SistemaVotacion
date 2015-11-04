var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    bodyParser = require('body-parser'),
    usuarios = {};

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.PORT || 8080,
    HOST = process.env.HOST || '192.168.11.47';

server.listen(PORT, HOST);

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/webmovil');
var Usuario     = require('./models/usuario');
var Respuesta   = require('./models/respuesta');
var Pregunta    = require('./models/pregunta');


var router = express.Router();

router.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

router.get('/admin', function(req, res) {
    res.sendFile(__dirname + '/admin.html');
});

router.route('/usuarios')
    .post(function(req, res) {
        
        var usuario = new Usuario();        
        usuario.nombre = req.body.nombre;
        usuario.email = req.body.email;
        usuario.password = req.body.password;  

        usuario.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Usuario creado' });
        });
    })
    .get(function(req, res) {
        Respuesta.find(function(err, encuestas) {
            if (err)
                res.send(err);

            res.json(encuestas);
        });
    });

app.use('/', router);

io.sockets.on('connection', function(socket) {

    socket.on('envia mensaje', function(data) {
        socket.broadcast.emit('mensaje nuevo', {msg: data, usuario: socket.usuario});
    });

    socket.on('guarda respuesta', function(data, callback) {
        Respuesta.findOne({_id: data.idRespuesta}, function(err, resp) {
            if(!err) {
                resp.total = resp.total + 1;
                resp.save(function(err) {
                    if(!err) {
                        actualizaPreguntas();
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                });
            }else{
                callback(false);
            }
        });
    });

    socket.on('guarda pregunta', function(data, callback) {
        var pregunta =  new Pregunta({
            pregunta : data.pregunta
        });

        pregunta.save(function(err,pre){
            if(err)
                callback(false);

            for(var i=0;i<data.respuestas.length;i++){
                var respuesta = new Respuesta({
                   respuesta: data.respuestas[i],
                   pregunta_id: pre._id
                });
                respuesta.save( function(err, res){
                    Pregunta.findOne(pre._id).exec(function(err,preg) {
                       preg.respuestas_id.push(res._id);
                       preg.save(function(err){
                       });
                    });
                });
            }

            Respuesta.find({pregunta_id: pre._id}).lean().exec(function (err, docs) {
                socket.broadcast.emit('nueva pregunta', {pregunta: pre.pregunta, idPregunta: pre._id, respuestas: docs});
            });

            callback(true);
        });
    });
    
    socket.on('nuevo usuario', function(data, callback) {
        if (data.usuario in usuarios) {
            callback(false);
        } else {
            Usuario.findOne({email: data.usuario, password: data.pass}, function(err, usuario){
                if(usuario){
                    callback(true);
                    socket.usuario = data.usuario;
                    usuarios[socket.usuario] = 1;
                    socket.broadcast.emit('usuario conectado', {usuario: socket.usuario});
                    actualizaUsuarios();
                    actualizaPreguntas();
                }else{
                    callback(false);
                }
            });
        }
    });

    socket.on('agrega usuario', function(data, callback) {
        var usuario =  new Usuario({
            nombre   : data.nombre,
            email  : data.usuario,
            password : data.pass
        });

        usuario.save(function(err,pre){
            if(err)
                callback(false);

            callback(true);
        });
    });
    
    socket.on('disconnect', function(data) {
        if(!socket.usuario) return;
        socket.broadcast.emit('usuario desconectado', {usuario: socket.usuario});
        delete usuarios[socket.usuario];
        actualizaUsuarios();
    });
    
    function actualizaUsuarios() {
        io.sockets.emit('usuarios', usuarios);
    }

    function actualizaPreguntas() {
        Pregunta.find({}).populate('respuestas_id').exec(function(err, preguntas) { 
            if(!err){
                io.sockets.emit('preguntas', JSON.stringify(preguntas)); 
            }
        });
    }

});