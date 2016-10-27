var fs=require("fs");
var _ = require("underscore");

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
    this.buscarUsuarioById = function(id){
        return _.find(this.usuarios,function(usu){
			return usu.id == id
		});
    }
}
    
function Nivel(num){
    this.nivel = num;
}

function Usuario(nombre){
    this.nombre = nombre;
    this.vidas = 5;
    //id hay que quitarlo y usaremos el _id de mongo, que se le añadira en el post del registro
    this.id = new Date().valueOf();
    this.nivel = 1;
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;