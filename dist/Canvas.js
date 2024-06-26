import { Game } from "./Game.js";
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
    static HEIGHT = window.innerHeight - 10;
    static WIDTH = innerWidth - 10;
    constructor() {
        this.screen.width = Canvas.WIDTH;
        this.screen.height = Canvas.HEIGHT;
    }
    get context() {
        return this._context;
    }
    startGame() {
        Game.instance;
        Game.instance.start();
    }
}
export { Canvas };
//# sourceMappingURL=Canvas.js.map