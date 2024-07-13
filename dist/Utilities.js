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
    // public static calculateAngleFromLeftOfCone(
    //   totalAngle: number, totalLength: number, distanceFromLeft: number
    // ): number {
    //   const OPPOSITE: number = totalLength / 2
    //   const HEIGHT: number = (OPPOSITE) / (Math.tan(totalAngle / 2))
    //   const ANGLE_FROM_CENTER: number = Math.atan(Math.abs(OPPOSITE - distanceFromLeft) / HEIGHT)
    //   if (distanceFromLeft <= OPPOSITE) {
    //     return (totalAngle / 2) - ANGLE_FROM_CENTER;
    //   } else {
    //     return (totalAngle / 2) + ANGLE_FROM_CENTER
    //   }
    // }
    static fillShapeOnVertices(vertices, color) {
        if (vertices.length >= 2) {
            let shape = new Path2D();
            shape.moveTo(vertices[0][0], vertices[0][1]);
            for (let i = 1; i < vertices.length; i++) {
                shape.lineTo(vertices[i][0], vertices[i][1]);
            }
            shape.closePath();
            Canvas.instance.context.fillStyle = color;
            Canvas.instance.context.fill(shape);
        }
    }
}
export { Utilities };
//# sourceMappingURL=Utilities.js.map