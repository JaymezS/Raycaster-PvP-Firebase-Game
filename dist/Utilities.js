"use strict";
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
}
//# sourceMappingURL=Utilities.js.map