function KeyLogger(level){
    this.level = level;
    this.mistakes = 0;
    var excessivePressing = {
        "w":0,
        "a":0,
        "s":0,
        "d":0,
        "ArrowLeft":0,
        "ArrowUp":0,
        "ArrowRight":0,
        "ArrowDown":0
    };
    var lastPressed = 0;
    var lastTimePress = 0;
    var keysPressed = 0;
    var self = this;
    document.addEventListener("keydown", function(e){
        console.log("Key down - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
        if(e.key != "a" && e.key != "w" && e.key != "s" && e.key != "d"){
            console.log("Mistake!");
            self.mistakes++;
        }
        if(e.key === lastPressed.key && Date.now() - lastTimePress > 250  && !e.repeat){
            excessivePressing[e.key]++;
            console.log(Date.now() - lastTimePress);
        }
        lastTimePress = Date.now();
        keysPressed++;
    });
    document.addEventListener("keypress", function(e){
        console.log("Key press - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
    });
    document.addEventListener("keyup", function(e){
        console.log("Key up - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
        lastPressed = {
            "key": e.key
        }    
    });
    this.seeStatistics = function(){
        var html = "<p>Number of key pressed = " + keysPressed + "</p>";
        html += "<p>Number of mistakes = " + this.mistakes + "</p>";
        for(var key in excessivePressing){
            html += "<p>Key = " + key + " - Times fast-pressed = " + excessivePressing[key] + "</p>";
        }
        $("#intro-row").append(html);
    }
}