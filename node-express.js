var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var port = config.port;
var emailUser = config.emailUser;
var emailPass = config.emailPass;
var exp = require("express");
var modelo = require("./servidor/modelo.js");

var app = exp();
var http = require('http').Server(app);

var juegofm = new modelo.JuegoFM('./servidor/prueba.json');
var juego = juegofm.makeJuego();
juego.connectMongo();

var ObjectID = require("mongodb").ObjectID;
var bodyParser = require("body-parser");

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_user: emailUser,
    api_key: emailPass
  }
}

var client = nodemailer.createTransport(sgTransport(options));
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

var mensaje = {
	from: 'donotanswer@emocook.com',
	subject: 'Confirme su cuenta',
	text: 'Hello world'
};

app.use(exp.static(__dirname + "/cliente/"));
app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.post("/registerEvaluationData/", function(request, response){
	console.log("REGISTRO EVALUACION!!!");
	console.log(request.body);
	juego.guardarDatosEvaluacion(request.body, response);
});

app.get("/obtenerResultadosEvaluacion/", function(request, response){
	console.log("obtenerResultadosEvaluacion");
	juego.getDatosEvaluacion(response);
})

app.get("/datosJuego/:id", function (request, response) {
	console.log("Datos juego");
	var id = request.params.id;
	console.log("\t DatosJuego -> \t id - " + id);
	var not_valid_food = [];
	var usuario = juego.buscarUsuarioById(id);
	var res = {};
	if(usuario && usuario.nivel <= juego.niveles.length){
		res = juego.niveles[usuario.nivel-1];
		if(usuario.nivel == 1){
			juego.addPartida(usuario);
		}
	} else {
		res = {nivel:-1, platforms:[], recipe:[]}	
	}
	
	var valid_food = [];
	for(var j = 0; j < res.recipe.ingredients.length; j++){
		valid_food.push(res.recipe.ingredients[j].name);
	}
	var direct = fs.readdirSync("./cliente/assets/food");
	usuario.modificarDificultad(0);
	var proporcion_basura_i = Math.floor(usuario.dificultad / 3) % 3;
	console.log(juego.proporcion_basura[proporcion_basura_i]);
	var limit = Math.ceil(res.recipe.ingredients.length / juego.proporcion_basura[proporcion_basura_i]);
	while(not_valid_food.length < limit){
		var random = Math.floor(Math.random() * direct.length);
		var food_i = direct[random].slice(0, -4);
		if(not_valid_food.indexOf(food_i) === -1 &&
			valid_food.indexOf(food_i) === -1){
				not_valid_food.push(food_i);
		}
	}
	console.log(not_valid_food);
	res.not_valid_food = not_valid_food;
	res.gravedad_nivel = juego.gravedad[usuario.dificultad % 3];
	res.probabilidad_ing_valido = juego.probabilidad_ing_valido[Math.floor(usuario.dificultad / 9) % 3];
	console.log("\t DatosJuego -> \t Datos a devolver -> " +  JSON.stringify(res.nivel));
	response.send(res);
});


app.get("/", function (request, response) {
	console.log("Inicio de página");
	var contenido = fs.readFileSync("./cliente/index_juego.html");
	response.setHeader("Content-type", "text/html");	
	response.send(contenido);
});
app.get("/welcome", function (request, response) {
	console.log("Bienvenida usuario");
	var contenido = fs.readFileSync("./cliente/html/welcome.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});
app.get("/bad-welcome", function (request, response) {
	console.log("Problema al confirmar");
	var contenido = fs.readFileSync("./cliente/html/bad_welcome.html");
	response.setHeader("Content-type", "text/html");
	response.send(contenido);
});

app.post('/login/', function(request, response){
	console.log("Login")
	var email_name = request.body.email_name;
	var password = request.body.password;
	if(password != undefined){
		password = encrypt(password);
	}
	if (user = juego.comprobarUsuario(email_name,password)){
		console.log("\t Usuario " + user.email + " existe");
		response.send(user);
	} else {
		console.log("\t Usuario " + email_name + " inexistente/inactivo o contrasena erronea. Login fallido");
		response.send({user_name:"ERROR"});
	}
});

app.post("/updateDetectionPermission/", function(request, response){
	var accept_affective = {
		affectiva: request.body.affectiva,
		beyond: request.body.beyond,
		keys: request.body.keys
    }; 
	juego.actualizarPermisosUsuario(request.body.usuario, accept_affective, response);
});

app.post('/affective-log/', function(request, response){
	console.log("Affective logs");
	console.log(request.body);
});

app.post("/crearUsuario/", function (request, response) {
	console.log("Crear usuarios")
	var user_name = request.body.user_name;
	var email = request.body.email;
	var pass = request.body.password;
	var urlD = request.body.url;
	var userFound = juego.buscarUsuario(email);
	var time_register = (new Date().valueOf());
	console.log(userFound);
	if(!userFound){
		console.log("\t Crear usuarios -> Usuario disponible");
		juego.agregarUsuario(user_name,email,encrypt(pass),time_register, false, response)
		var url = urlD + "/confirmarCuenta/" + email + "/" + time_register;
		var html = '¡¡Bienvenido a emoCook!! <br/> Confirme su cuenta haciendo clic en el siguiente enlace: <br/>';
		html += '<a href='+url+'>'+url+'</a>';
		mensaje.to = email;
		mensaje.html = html;
		function callbackSendEmail(errr,info){
			if (errr){
				console.log(errr);
				console.log("\t Crear usuarios -> Error en el envio de email de confirmación");
				response.send({result:"EmailNotSent"})
			}
			else {
				console.log("\t Crear Usuario -> \t Email enviado");
			}
		}
		client.sendMail(mensaje, callbackSendEmail);
	} else {
		console.log("\t Crear usuarios -> Usuario no disponible");
		response.send({result:"userExists"})
	}
});

app.get("/confirmarCuenta/:email/:id", function (request, response) {
	console.log("Confirmar cuenta")
	var email = request.params.email;
	var id = parseInt(request.params.id);
	//var contenido;
	if(juego.confirmarUsuario(email,id)){
		console.log("\t Confirmar cuenta -> Usuario activado");
		response.setHeader("Location", "/welcome");
	} else {
		console.log("\t Confirmar cuenta -> \t El usuario ya se ha confirmado o no se ha registrado");
		response.setHeader("Location", "/bad-welcome");
	}
	response.statusCode = 302; 
	response.setHeader("Content-type", "text/html");
	response.send({});
});

app.post("/modificarUsuario/", function (request, response) {
	console.log("Modificar usuario");
	var oldMail = request.body.old_email;
	var newEmail = request.body.new_email;
	var newPass = request.body.new_password;
	var newUserName = request.body.new_user_name;
	console.log("\t Modificar usuario -> Datos usuario");
	console.log("\t\t Email viejo -> " +oldMail);
	console.log("\t\t Email nuevo -> " +newEmail)
	console.log("\t\t UserName nuevo -> " +newUserName)
	console.log("\t\t Password nueva -> " +newPass)
	console.log("\t\t Modificar usuario -> Datos usuario");

	juego.modificarUsuario(newUserName, oldMail, newEmail, encrypt(newPass), response)
});

app.delete("/eliminarUsuario/", function (request, response) {
	console.log("Eliminar usuario");
	var email = request.body.email;
	var pass = encrypt(request.body.password);
	console.log("\t Eliminar usuario -> \t Email -> " +email);
	console.log("\t Eliminar usuario -> \t Password -> " +pass)
	juego.eliminarUsuario(email, pass, response)
});

app.get("/resultados/", function (request, response) {
	juego.getResultados(response);
});	


app.get('/limpiarMongo/', function(request,response){
	juego.limpiarMongoPRUEBAS(response);
	juego = juegofm.makeJuego();
});

app.post('/modificarDificultad/:id/', function (request, response) {
	console.log("Dificultad modificada");
	var id = request.params.id;
	var dificulty_increment = parseInt(request.body.variacion);
	var usuario = juego.buscarUsuarioById(id);
	if(usuario != undefined){
		usuario.modificarDificultad(dificulty_increment);
		console.log("\t Nueva dificultad ->" + usuario.dificultad);
		response.send({"result":"ok"});
	} else {
		response.send({"result":"ERROR"});
	}
});

app.post('/nivelCompletado/:id/:tiempo/:vidas', function (request, response) {
	console.log("Nivel completado");
	var id = request.params.id;
	var tiempo = parseInt(request.params.tiempo);
	var vidas = parseInt(request.params.vidas);
	var usuario = juego.buscarUsuarioById(id);
	var affectiva_data = request.body;
	var affectiva = affectiva_data.affectiva;
	var beyond = affectiva_data.beyond;
	var keys = affectiva_data.keys;
	var dificulty_increment = 1;
	var change_difficulty = {
		keys: "none",
		affectiva: "none",
		beyond: "none"
	};
	//Si se han detectado muchas pulsaciones excesivas y muchos errores, asumimos que hay que bajar
	//la dificultad
	for(var property in keys){
		var key_hit;
		if(keys.hasOwnProperty(property)){
			switch(property){
				case "mistakes":
					if(keys[property]>12){
						key_hit = true;
					}
					break;
				case "excessivePressing":
					var number = 0;
					for(var exc_property in keys[property]){
						if(keys[property].hasOwnProperty(exc_property)){
							if(keys[property][exc_property] >= 10){
								number++;
							}
						}
					}
					if(number >= 2){
						key_hit = true;
					}
					break;
			}
			if(key_hit){
				change_difficulty["keys"] = "down";
				break;
			}
		}
	}
	for(var i = 0; i < affectiva.length; i++){
		var number = 0;
		for(var property in affectiva[i]){
			if(affectiva[i].hasOwnProperty(property)){
				switch(property){
					case "emotions":
						if ((affectiva[i][property].valence < -10) || 
							(affectiva[i][property].disgust > 40) || 
							(affectiva[i][property].sadness > 40) ||
							(affectiva[i][property].anger > 40)){
							number++;
						}
						break;
					case "expressions":
						if((affectiva[i][property].upperLipRaise > 50) ||
						   (affectiva[i][property].browFurrow > 50) ||
						   (affectiva[i][property].browFurrow > 50 && affectiva[i][property].smirk > 50) ||
						   (affectiva[i][property].noseWrinkle > 50)
						) {
							number++;
						}
						break;
				}
			}
		}
		if((number / affectiva.length*2) > 0.5){
			console.log("Nivel complejo - bajamos dificultad");
			change_difficulty["affectiva"] = "down";
		} else {
			change_difficulty["affectiva"] = "up";
		}
	}
	console.log(change_difficulty);
	if(change_difficulty["affectiva"] == "down" && change_difficulty["keys"] == "down"){
		dificulty_increment = -3;
	} else if (change_difficulty["affectiva"] == "down") {
		dificulty_increment = -2;
	} else if (change_difficulty["affectiva"] == "up") {
		dificulty_increment = 2;
	}
	if(usuario != undefined){
		console.log("\t Nivel completado -> \t Usuario encontrado en nivel completado")
		usuario.modificarDificultad(dificulty_increment);
		console.log("\t Nivel completado -> \t Nueva dificultad -> \t" + usuario.dificultad);
		juego.guardarPartida(usuario, tiempo, vidas, affectiva_data, response);
		console.log("\t Nivel completado -> \t Usuario " + id + " - Tiempo " + tiempo + "-  IdJuego - " + usuario.idJuego);
	} else {
		//Codigo legado de prueba antigua
		console.log("\t Nivel completado -> \t Usuario NO encontrado en nivel completado")
		usuario = new modelo.Usuario("dummy");
		usuario.nivel = -2;
	}
	console.log("\t Nivel completado -> \tNuevo nivel es ->" + usuario.nivel);
});

app.get('/obtenerResultados/:id', function (request, response) {
	var id = request.params.id;
	var user = juego.buscarUsuarioById(id);
	if(user == undefined){
		user = new modelo.Usuario("dummyRes");
		user.resultados.push(1);
	}
	//console.log(juego.getPartida(user).resultados);
	response.send(juego.getPartida(user).resultados);
	//response.send(user.resultados);
});

app.post('/meterEnUsuarios/', function(request, response){
	var user_name = request.body.user_name;
	var email = request.body.email;
	var pass = request.body.password;
	var urlD = request.body.url;
	var time_register = (new Date().valueOf());
	var act = JSON.parse(request.body.activo);
	//console.log(pass)
	juego.insertarUsuarioPRUEBAS(user_name,email,encrypt(pass),time_register,act,response);
});


console.log("Servidor escuchando en el puerto " + port);
//app.listen(process.env.PORT || port);
http.listen(process.env.PORT || port, function(){
  console.log('Listening on port ' + port);
});