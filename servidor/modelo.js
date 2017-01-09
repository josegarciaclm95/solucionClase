var fs=require("fs");
var _ = require("underscore");
//var persistencia = require("./servidor/persistencia.js");
//persistencia.mongoConnect();

function Juego(){
    this.nombre = "Niveles";
    this.niveles = [];
    this.usuarios = [];
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.agregarUsuario = function(usuario,pass,juego,response){
        var a = this.buscarUsuario(usuario.email);
        if(a == undefined){
            console.log("\t Model -> \t Agregado nuevo usuario al modelo");
            this.usuarios.push(usuario);
        } else {
            console.log("\t Model -> \t El usuario ya existia. Se refrescan datos");
            a.nivel = 1;
            a.resultados = [];
            a.idJuego = usuario.idJuego
        }
    };
    this.buscarUsuario = function(nombre_us){
        return this.usuarios.filter(function(actual_element){
            return actual_element.email == nombre_us;
        })[0];
    }
    this.buscarUsuarioById = function(id){
        return _.find(this.usuarios,function(usu){
			return usu.id == id
		});
    }
    this.eliminarUsuario = function(nombre_us){
        console.log("\t Model -> \t Numero de usuarios " + this.usuarios.length);
        var index = this.usuarios.indexOf(this.buscarUsuario(nombre_us));
        this.usuarios.splice(index,1);
        console.log("\t Model -> \t Usuario eliminado. Numero de usuarios " + this.usuarios.length);
    }
    this.modificarUsuario = function(oldMail,newEmail){
        var user = this.buscarUsuario(oldMail);
        if (user != undefined){
            user.email = newEmail;
        }
    }
    this.limpiar = function(){
        console.log("\tJuego vacio")
        this.niveles = [];
        this.usuarios = [];
    }
    Juego.prototype.toString = function(){
        var res = "Usuarios\n";
        this.usuarios.forEach(function(el){
            res += "Usuario " + el.email + " - Id " + el.idJuego + "\n";
        });
        res += "Niveles\n";
        this.niveles.forEach(function(el){
            res += "Nivel " + el.nivel + " - Coordenadas " + el.platforms + "\n";
        });
        return res;
    }
}
    
function Nivel(num,coord,gravedad,numEstrellas){
    this.nivel = parseInt(num[5]);
    this.platforms = coord;
    this.gravity = gravedad;
    this.starsNumber = numEstrellas;
}

function Usuario(email){
    this.email = email;
    this.vidas = 5;
    this.idJuego = new Date().valueOf();
    this.nivel = 1;
    this.resultados = []
    this.agregarResultado = function (result){
        this.resultados.push(result);
    }
    Usuario.prototype.toString = function(){
        var r = "Usuario " + this.email + " - Id " + this.id + "\n";
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
        for(var x in this.array){
            var nivel = new Nivel(x,this.array[x].platforms,this.array[x].gravity,this.array[x].starsNumber);
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