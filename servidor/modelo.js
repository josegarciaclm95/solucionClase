var fs=require("fs");

function Juego(){
    this.nombre = "Niveles";
    this.niveles = [];
    this.usuarios = [];
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.agregarUsuario = function(usuario){
        this.usuarios.push(usuario);
    };
    this.buscarUsuario = function(nombre_us){
        return this.usuarios.filter(function(actual_element){
            return actual_element.nombre == nombre_us;
        })[0];
    }
}
    
function Nivel(num){
    this.nivel = num;
}

function Usuario(nombre){
    this.nombre = nombre;
    this.puntuacion = 0;
    this.vidas = 5;
    var file = fs.readFileSync("./juego.json");
	var data = JSON.parse(file);
	if(typeof(data[this.nombre]) == "undefined"){
        data[this.nombre] = 0;
        this.record = 0;
	} else {
		this.puntuacion = data[this.nombre];
	}
    fs.writeFile("./juego.json", JSON.stringify(data), function(err) {
		if(err) {
			return console.log(err);
		}
    	console.log("Datos de juego actualizados");
	}); 
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;