"use strict";
class Player {
    _x = GameMap.tileSize * 1.5;
    _y = GameMap.tileSize * 1.5;
    _angle = 0;
    _speed = 3;
    _rotationSpeed = 0.05;
    _fov = Math.PI / 3; // Field of view
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get angle() {
        return this._angle;
    }
    get speed() {
        return this._speed;
    }
    get fov() {
        return this._fov;
    }
    get rotationSpeed() {
        return this._rotationSpeed;
    }
    set angle(angle) {
        this._angle = angle;
    }
    moveForward() {
        this._x += this.speed * Math.cos(this.angle);
        this._y += this.speed * Math.sin(this.angle);
    }
    moveBackward() {
        this._x -= this.speed * Math.cos(this.angle);
        this._y -= this.speed * Math.sin(this.angle);
    }
}
//# sourceMappingURL=Player.js.map