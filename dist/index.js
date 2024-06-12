import { Canvas } from "./Canvas.js";
import { Game } from "./Game.js";
import { VectorMath } from "./Vector.js";
class Driver {
    constructor() {
        Canvas.instance;
        Canvas.instance.startGame();
    }
}
new Driver();
//@ts-ignorets-ignore
window.Driver = Driver;
//@ts-ignorets-ignore
window.Game = Game;
//@ts-ignorets-ignore
window.VectorMath = VectorMath;
//# sourceMappingURL=index.js.map