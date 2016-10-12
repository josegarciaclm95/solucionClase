
var fs=require("fs");
var config=JSON.parse(fs.readFileSync("config.json"));
var host=config.host;
var port=config.port;
var exp=require("express");
var modelo = require("./servidor/modelo.js");
var app=exp(); 
var juego = new modelo.Juego();

//app.use(app.router);
app.use(exp.static(__dirname +"/cliente/"));

app.get("/",function(request,response){
	var contenido=fs.readFileSync("./cliente/index.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});

app.get("/crearUsuario/:nombre", function(request, response){
	//Crear el usuario con el nombre recibido
	var usuario = new modelo.Usuario(request.params.nombre);
	juego.agregarUsuario(usuario);
	console.log("Nombre: " + request.params.nombre);
	response.send(juego);
});

app.get("/resultados/", function(request, response){
	//Crear el usuario con el nombre recibido
	var file = fs.readFileSync("./juego.json");
	var data = JSON.parse(file);
	console.log(data);
	response.send(data);
});

app.get("/puntuaciones/:nombre/:puntos", function(request, response){
	//Crear el usuario con el nombre recibido
	console.log("Nombre recibido por parametros " + request.params.nombre);
	var user = juego.buscarUsuario(request.params.nombre);
	console.log(user);
	user.puntuacion = parseInt(request.params.puntos);
	console.log(user.puntuacion);
	var file = fs.readFileSync("./juego.json");
	var data = JSON.parse(file);
	console.log(typeof(data[user.nombre]));
	/*if(typeof(data[user.nombre]) == "undefined"){
		console.log("Creo nuevo registro");
		data[user.nombre] = user.puntuacion;
	} else {*/
	console.log("Actualizo registro");
	data[user.nombre] = user.puntuacion > data[user.nombre] ?  user.puntuacion : data[user.nombre]
	//}
	console.log(data);
	fs.writeFile("./juego.json", JSON.stringify(data), function(err) {
		if(err) {
			return console.log(err);
		}
    	console.log("The file was saved!");
	}); 
	console.log("Usuario actualizado");
	response.send(juego);
});


//console.log("Servidor escuchando en el puerto "+process.env.PORT );
//app.listen(process.env.PORT || 1338);
console.log("Servidor escuchando en el puerto "+ port );
app.listen(port,host);
