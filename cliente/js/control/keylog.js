function KeyLogger(){
    this.mistakes = 0;
    this.excessivePressing = {
        "w":0,
        "a":0,
        "s":0,
        "d":0,
        "ArrowLeft":0,
        "ArrowUp":0,
        "ArrowRight":0,
        "ArrowDown":0
    };
    this.lastTimePress = 0;
    this.keysPressed = 0;
    var self = this;
    this.start = function(){
        document.addEventListener("keydown", function(e){
            if(e.key == "1"){
                self.seeStatistics();
            }
            if(!e.repeat){
                console.log("Key down - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
                console.log("Nueva key " + e.key + "down");
                self.lastTimePress = Date.now();
                self.keysPressed++;
                if(e.key != "ArrowLeft" && e.key != "ArrowUp" && e.key != "ArrowDown" && e.key != "ArrowRight" 
                && e.key != "a" && e.key != "w" && e.key != "s" && e.key != "d"){
                    self.mistakes++;
                }
            }
        });
        document.addEventListener("keyup", function(e){
            console.log("Key up - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
            console.log(Date.now() - self.lastTimePress);
            if(Date.now() - self.lastTimePress < 60){
                self.excessivePressing[e.key]++;
            }
        });
    }
    
    this.stop = function(){
        document.addEventListener("keyup", function(e){});
        document.addEventListener("keydown", function(e){});
    }
    this.seeStatistics = function(){
        var html = "<p>Number of key pressed = " + self.keysPressed + "</p>";
        html += "<p>Number of mistakes = " + self.mistakes + "</p>";
        for(var key in self.excessivePressing){
            html += "<p>Key = " + key + " - Times fast-pressed = " + self.excessivePressing[key] + "</p>";
        }
        $("#intro-row").append(html);
    }
    this.getKeysInformation = function () {
        return {
            "mistakes":self.mistakes,
            "excessivePressing":self.excessivePressing,
            "keysPressed":self.keysPressed
        }
    }
}