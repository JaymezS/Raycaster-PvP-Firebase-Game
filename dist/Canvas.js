"use strict";
class Canvas {
    static _instance;
    static get instance() {
        if (Canvas._instance === undefined) {
            Canvas._instance = new Canvas();
        }
        return Canvas._instance;
    }
    screen = document.getElementById("game-screen");
    _context = this.screen.getContext("2d");
    static WIDTH = 900;
    static HEIGHT = 500;
    constructor() {
        this.screen.width = Canvas.WIDTH;
        this.screen.height = Canvas.HEIGHT;
        console.log('canvas resized');
    }
    get context() {
        return this._context;
    }
    startGame() {
        Game.instance;
    }
}
//# sourceMappingURL=Canvas.js.map