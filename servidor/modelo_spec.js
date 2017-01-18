var modelo = require("./modelo");

describe("El juego tiene inicialmente...", function () {
    var juego;
    beforeEach(function () {
        juego = new modelo.Juego();
    });
    it("Una colección de niveles y usuarios vacia", function () {
        expect(juego.niveles.length).toEqual(0);
        expect(juego.usuarios.length).toEqual(0);
    });
    //xit para que se ignore un test a medias
    it("Agregar niveles", function () {
        juego.agregarNivel(new modelo.Nivel("nivel1"));
        expect(juego.niveles.length).toEqual(1);
        expect(juego.niveles[0].nivel).toEqual(1);
    });
    it("Agregar usuarios", function () {
        var us = new modelo.Usuario("Jose")
        juego.usuarios.push(us);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.usuarios[0]).toEqual(us);
        expect(juego.usuarios[0].user_name).toEqual("Jose");
        expect(juego.usuarios[0].user_name).not.toEqual("Juan");
    });
    it("Buscar usuarios por nombre e id", function () {
        var us = new modelo.Usuario("Jose")
        us.id = 3;
        juego.usuarios.push(us);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.buscarUsuario("Jose")).toEqual(us);
        expect(juego.buscarUsuario("Pepe")).toEqual(undefined);
        expect(juego.buscarUsuarioById(us.id)).toEqual(us);
        expect(juego.usuarios[0].user_name).not.toEqual("Juan");
    });
    it("Crear juego por fichero JSON", function () {
        var jFM = new modelo.JuegoFM('./servidor/juego-json.json');
        juego = jFM.makeJuego();
        expect(juego.niveles.length).toEqual(4);
        expect(juego.niveles[0].nivel).toEqual(1);
        expect(juego.niveles[1].nivel).toEqual(2);
        expect(juego.niveles[2].nivel).toEqual(3);
        expect(juego.niveles[3].nivel).toEqual(4);
    });
    it("Crear Registro en Gestor de partidas", function () {
        var user = juego.newUsuario("jose", "jose@email", "passjose", 1, true, 20);
        juego.addRegistro(user.id);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.gestorPartidas.partidas.length).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].id_usuario).toEqual(20);
    });
    it("Crear Registro y Partida en Gestor de partidas", function () {
        var user = juego.newUsuario("jose", "jose@email", "passjose", 1, true, 20);
        juego.addRegistro(user.id);
        juego.addPartida(user);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.gestorPartidas.partidas.length).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].id_usuario).toEqual(20);
        expect(juego.gestorPartidas.partidas[0].partidas.length).toEqual(1);
    });
    it("Crear Registro, Partida y Resultado de partida en Gestor de partidas", function () {
        var user = juego.newUsuario("jose", "jose@email", "passjose", 1, true, 20);
        juego.addRegistro(user.id);
        juego.addPartida(user);
        juego.gestorPartidas.partidas[0].partidas[0].agregarResultado(1,4,5);
        expect(juego.usuarios.length).toEqual(1);
        expect(juego.gestorPartidas.partidas.length).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].id_usuario).toEqual(20);
        expect(juego.gestorPartidas.partidas[0].partidas.length).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].partidas[0].resultados.length).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].partidas[0].resultados[0].nivel).toEqual(1);
        expect(juego.gestorPartidas.partidas[0].partidas[0].resultados[0].tiempo).toEqual(4);
        expect(juego.gestorPartidas.partidas[0].partidas[0].resultados[0].vidas).toEqual(5);
    });
});