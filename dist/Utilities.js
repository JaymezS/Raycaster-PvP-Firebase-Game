import { Canvas } from "./Canvas.js";
import { Game } from "./Game.js";
class Utilities {
    static drawLine(x1, y1, x2, y2, color) {
        const CONTEXT = Canvas.instance.context;
        CONTEXT.strokeStyle = color;
        CONTEXT.beginPath();
        CONTEXT.moveTo(x1, y1);
        CONTEXT.lineTo(x2, y2);
        CONTEXT.stroke();
        CONTEXT.closePath();
    }
    static drawPixel(x, y, color) {
        Canvas.instance.context.fillStyle = color;
        Canvas.instance.context.fillRect(x, y, Game.instance.resolution, Game.instance.resolution);
    }
    // lower bound inclusive, upper exclusive
    static randInt(low, high) {
        return Math.floor(Math.random() * (high - low)) + low;
    }
}
export { Utilities };
//# sourceMappingURL=Utilities.js.map