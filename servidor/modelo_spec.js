var modelo = require("./modelo");

describe("El juego tiene inicialmente...", function() {
    var juego;
    beforeEach(function(){
        juego = new modelo.Juego();
    });
    it("Una colección de niveles y usuarios vacia", function() {
        expect(juego.niveles.length).toEqual(0);
        expect(juego.usuarios.length).toEqual(0);
    });
    //xit para que se ignore un test a medias
    it("Agregar niveles", function(){
        juego.agregarNivel(new modelo.Nivel(2));
        expect(juego.niveles.length).toEqual(1);
        expect(juego.niveles[0].nivel).toEqual(2);
    });
    it("Agregar usuarios", function(){
        var us = new modelo.Usuario("Jose")
        juego.agregarUsuario(us);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.usuarios[0]).toEqual(us);
        expect(juego.usuarios[0].nombre).toEqual("Jose");
        expect(juego.usuarios[0].nombre).not.toEqual("Juan");
    });
    it("Buscar usuarios por nombre e id", function(){
        var us = new modelo.Usuario("Jose")
        juego.agregarUsuario(us);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.buscarUsuario("Jose")).toEqual(us);
        expect(juego.buscarUsuario("Pepe")).toEqual(undefined);
        expect(juego.buscarUsuarioById(us.id)).toEqual(us);
        expect(juego.usuarios[0].nombre).not.toEqual("Juan");
    });
});