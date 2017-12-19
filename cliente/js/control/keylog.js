function KeyLogger(controller) {
    this.controller = controller;
    this.mistakes = 0;
    this.excessivePressing = {
        "w": 0,
        "a": 0,
        "s": 0,
        "d": 0,
        "ArrowLeft": 0,
        "ArrowUp": 0,
        "ArrowRight": 0,
        "ArrowDown": 0
    };
    this.lastTimePress = 0;
    this.keysPressed = 0;
    var self = this;
    this.start = function () {
        document.addEventListener("keydown", keydownCallback);
        document.addEventListener("keyup", keyupCallback);
    }
    this.stop = function () {
        console.log("KEYLOG STOP");
        document.removeEventListener("keydown", keydownCallback);
        document.removeEventListener("keyup", keyupCallback);
    }
    this.seeStatistics = function () {
        var html = "<p>Number of key pressed = " + self.keysPressed + "</p>";
        html += "<p>Number of mistakes = " + self.mistakes + "</p>";
        for (var key in self.excessivePressing) {
            html += "<p>Key = " + key + " - Times fast-pressed = " + self.excessivePressing[key] + "</p>";
        }
        $("#intro-row").append(html);
    }
    this.getKeysInformation = function () {
        return {
            "mistakes": self.mistakes,
            "excessivePressing": self.excessivePressing,
            "keysPressed": self.keysPressed
        }
    }
    var keydownCallback = function (e) {
        if (!e.repeat) {
            console.log("Key down - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
            console.log("Nueva key " + e.key + "down");
            console.log(self);
            self.controller.keylogger.lastTimePress = Date.now();
            self.controller.keylogger.keysPressed++;
            if (e.key != "ArrowLeft" && e.key != "ArrowUp" && e.key != "ArrowDown" && e.key != "ArrowRight"
                && e.key != "a" && e.key != "w" && e.key != "s" && e.key != "d") {
                self.controller.keylogger.mistakes++;
            }
        }
    };
    var keyupCallback = function (e) {
        console.log(self);
        console.log("Key up - Char code " + e.charCode + " - Key " + e.key + " - Keycode " + e.keyCode + " - Key Repeat " + e.repeat);
        console.log(Date.now() - self.controller.keylogger.lastTimePress);
        if (Date.now() - self.controller.keylogger.lastTimePress < 60) {
            self.controller.keylogger.excessivePressing[e.key]++;
        }
    };
}