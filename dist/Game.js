"use strict";
class Game {
    static _instance;
    constructor() {
        console.log("game started");
    }
    static get instance() {
        if (Game._instance === undefined) {
            Game._instance = new Game();
        }
        return Game._instance;
    }
}
//# sourceMappingURL=Game.js.map