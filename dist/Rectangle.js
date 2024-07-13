import { Canvas } from "./Canvas.js";
class Rectangle {
    _x;
    _y;
    color;
    _width;
    _height;
    constructor(_x, _y, color, _width, _height) {
        this._x = _x;
        this._y = _y;
        this.color = color;
        this._width = _width;
        this._height = _height;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    draw() {
        Canvas.instance.context.fillStyle = this.color;
        Canvas.instance.context.fillRect(this.x, this.y, this.width, this.height);
    }
}
export { Rectangle };
//# sourceMappingURL=Rectangle.js.map