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
    static calculateAngleFromLeftOfCone(totalAngle, totalLength, distanceFromLeft) {
        const OPPOSITE = totalLength / 2;
        const HEIGHT = (OPPOSITE) / (Math.tan(totalAngle / 2));
        const ANGLE_FROM_CENTER = Math.atan(Math.abs(OPPOSITE - distanceFromLeft) / HEIGHT);
        if (distanceFromLeft <= OPPOSITE) {
            return (totalAngle / 2) - ANGLE_FROM_CENTER;
        }
        else {
            return (totalAngle / 2) + ANGLE_FROM_CENTER;
        }
    }
}
export { Utilities };
//# sourceMappingURL=Utilities.js.map