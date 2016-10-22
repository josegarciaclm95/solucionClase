/**********************************************************************
 * "/" - Se responde con el index
 * "/crearUsuario/nombre" - Crea el usuario y devuelve el juego junto con sus datos. Dentro de agregarUsuario() se crea
 * su registro en el fichero juego.json, con miras a ahorrar comprobaciones cuando se guarde su score
 * "/resultados/" - Lee el contenido de juego.json
 *
 * *
 *
 **********************************************************************/
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host;
var port = config.port;
var exp = require("express");
var modelo = require("./servidor/modelo.js");
var app = exp();
var juego = new modelo.Juego();
var usuariosCol;
//var MongoClient = require('mongodb');

//app.use(app.router);
app.use(exp.static(__dirname + "/cliente/"));

app.get("/mierdaPrueba/", function (request, response) {
	var jsa = JSON.parse(fs.readFileSync("./cliente/js/juego-json.json"));
	response.send(jsa);
});

app.get("/datosJuego/:nivel", function (request, response) {
	console.log("Llamada a /datosJuego/" + request.params.nivel);
	var jsa = JSON.parse(fs.readFileSync("./cliente/js/juego-json.json"));
	console.log("Respuesta es -> " + jsa[request.params.nivel]);
	console.log(request.params.nivel);
	response.send(jsa[request.params.nivel]);
});
app.get("/", function (request, response) {
	//var jsa = JSON.parse(fs.readFileSync("./cliente/js/juego-json.json"));
	console.log("Inicio de página");
	//console.log(jsa.nivel1);
	//console.log(jsa.nivel1.platforms);
	//insertar({nombre:"Pepe",email:"pe@pe.com",clave:"pepe"});
	var contenido = fs.readFileSync("./cliente/index.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});

app.get("/crearUsuario/:nombre", function (request, response) {
	//Crear el usuario con el nombre recibido
	var usuario = new modelo.Usuario(request.params.nombre);
	juego.agregarUsuario(usuario);
	console.log("Nombre: " + request.params.nombre);
	response.send(usuario);
});

app.get("/resultados/", function (request, response) {
	var file = fs.readFileSync("./juego.json");
	var data = JSON.parse(file);
	console.log(data.puntuaciones);
	response.send(data.puntuaciones);
});

/*
app.get("/puntuaciones/:nombre/:puntos", function (request, response) {
	//Crear el usuario con el nombre recibido
	console.log("Nombre recibido por parametros " + request.params.nombre);
	var user = juego.buscarUsuario(request.params.nombre);
	console.log(user);
	user.puntuacion = parseInt(request.params.puntos);
	console.log(user.puntuacion);
	var file = fs.readFileSync("./juego.json");
	var data = JSON.parse(file);
	console.log(typeof (data[user.nombre]));

	console.log("Actualizo registro");
	data[user.nombre] = user.puntuacion > data[user.nombre] ? user.puntuacion : data[user.nombre]
	//}
	console.log(data);
	fs.writeFile("./juego.json", JSON.stringify(data), function (err) {
		if (err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});
	console.log("Usuario actualizado");
	response.send(user);
});
*/
app.get('/comprobarUsuario/:id', function (request, response) {
	var id = request.params.id;
	var usuario = juego.buscarUsuarioById(id);
	if (usuario == undefined) {
		response.send({ 'nivel': -1 });
	} else {
		response.send({ 'nivel': usuario.nivel, 'vidas': usuario.vidas });
	}
});

app.get('/nivelCompletado/:id/:tiempo', function (request, response) {
	var id = request.params.id;
	var tiempo = request.params.tiempo;
	var usuario = juego.buscarUsuarioById(id);
	console.log(id + " - " + tiempo + " - " + usuario);
	usuario.nivel += 1;
	console.log(usuario.nivel);
	usuario.tiempo = tiempo;
	if (usuario != undefined) {
		var result = {}
		result.user = usuario.nombre;
		result.score = usuario.tiempo;
		var data = JSON.parse(fs.readFileSync("./juego.json"));
		var userRecord = data.puntuaciones.filter(function(jsonEl){
			return jsonEl.user == usuario.nombre;
		});
		if(userRecord.length == 0){
			data.puntuaciones.push(result);
			console.log("Puntuaciones guardadas tras push ->\n" + data.puntuaciones);
		} else {
			if (userRecord[0].score > tiempo){
				userRecord[0].score = tiempo;
			} 
		}
		fs.writeFile("./juego.json", JSON.stringify(data), function (err) {
			if (err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});
	}
	console.log("Nuevo nivel es ->" + usuario.nivel);
	response.send({'nivel':usuario.nivel});
});

app.get('/obtenerResultados/:id', function (request, response) {
	var id = request.params.id;
	var usuario = juego.buscarUsuarioById(id);
	response.send({'nivel':usuario.nivel, 'tiempo':usuario.tiempo, 'nombre':usuario.nombre});
});

console.log("Servidor escuchando en el puerto "+process.env.PORT );
app.listen(process.env.PORT || port);
//console.log("Servidor escuchando en el puerto " + port);
//app.listen(port, host);


assert = require('assert');
// Connection URL
var urlM = 'mongodb://localhost:27017/';
/*
var db = new MongoClient.Db("usuarioscn", new MongoClient.Server("127.0.0.1","27017",{}));

db.open(function(err){
   console.log("Conectando a Mongo: usuarioscn");
    db.collection("usuarios",function (err,col) {
        console.log("Tenemos la colección");
        usuariosCol = col;
    });
});


//insertar({nombre:"Pepe",email:"pe@pe.com",clave:"pepe"});

function insertar(usu){
    usuariosCol.insert(usu, function (err){
        if(err){
            console.log(err);
        } else {
            console.log("Nuevo usuario creado");
        }
    })
}
*/