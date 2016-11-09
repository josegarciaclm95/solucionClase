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
        var a = this.buscarUsuario(usuario.nombre);
        if(a == undefined){
            this.usuarios.push(usuario);
        } else {
            console.log("El usuario ya existia");
            var u = this.buscarUsuario(usuario.nombre);
            u.nivel = 1;
            u.resultados = [];
        }
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
    Juego.prototype.toString = function(){
        var res = "Usuarios\n";
        this.usuarios.forEach(function(el){
            res += "Usuario " + el.nombre + " - Id " + el.idJuego + "\n";
        });
        res += "Niveles\n";
        this.niveles.forEach(function(el){
            res += "Nivel " + el.nivel + " - Coordenadas " + el.platforms + "\n";
        });
        return res;
    }
}
    
function Nivel(num,coord,gravedad){
    this.nivel = parseInt(num[5]);
    this.platforms = coord;
    this.gravity = gravedad;
}

function Usuario(nombre){
    this.nombre = nombre;
    this.vidas = 5;
    this.idJuego = new Date().valueOf();
    this.nivel = 1;
    this.resultados = []
    this.agregarResultado = function (result){
        this.resultados.push(result);
    }
    Usuario.prototype.toString = function(){
        var r = "Usuario " + this.nombre + " - Id " + this.id + "\n";
        r += "Nivel actual " + this.nivel + "\n";
        for(var i in this.resultados){
            r += this.resultados[i].toString() + "\n";
        } 
        return r;
    }
}

function Resultado(nivel,tiempo){
    this.nivel = nivel;
    this.tiempo = tiempo;
    Resultado.prototype.toString = function(){
        return "Nivel " + this.nivel + " - Tiempo " + this.tiempo; 
    }
}

function JuegoFM(archivo){
    this.juego = new Juego();
    this.array = leerCoordenadas(archivo);
    this.makeJuego = function(){
        var j = new Juego();
        var i = 0;
        for(var x in this.array){
            console.log(x);
            var nivel = new Nivel(x,this.array[x].platforms,this.array[x].gravity);
            j.agregarNivel(nivel);
        }
        return j;
    }
}

function leerCoordenadas(archivo){
    var array = JSON.parse(fs.readFileSync(archivo));
    return array;
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;
module.exports.JuegoFM = JuegoFM;
module.exports.Resultado = Resultado;