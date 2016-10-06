
var fs=require("fs");
var config=JSON.parse(fs.readFileSync("config.json"));
var host=config.host;
var port=config.port;
var exp=require("express");
var modelo = require("./servidor/modelo.js");
var app=exp(); 


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
	console.log("Nombre: " + request.params.nombre);
});

console.log("Servidor escuchando en el puerto "+port);
app.listen(port,host);

