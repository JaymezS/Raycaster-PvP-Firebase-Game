"use strict";
class Player {
    // note that x and y are center values
    _x = GameMap.tileSize * 1.5;
    _y = GameMap.tileSize * 1.5;
    _z = GameMap.tileSize * 1.5;
    size = 32;
    _yaw = 0;
    _pitch = 0;
    _speed = 3;
    _rotationSpeed = Math.PI / 180;
    _fov = Math.PI / 4; // Field of view
    horizontalSpeed = Math.cos(this._pitch) * this._speed;
    xVelocity = this.horizontalSpeed * Math.cos(this._yaw);
    yVelocity = this.horizontalSpeed * Math.sin(this._yaw);
    zVelocity = this._speed * Math.sin(this._pitch);
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get z() {
        return this._z;
    }
    get yaw() {
        return this._yaw;
    }
    get pitch() {
        return this._pitch;
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
    set yaw(angle) {
        this._yaw = angle;
    }
    set pitch(angle) {
        this._pitch = angle;
    }
    moveForward() {
        this.updateVelocities();
        this.moveX();
        this.moveY();
        this.moveZ();
    }
    moveRight() {
        this.updateVelocities();
        const temp = this.xVelocity;
        this.xVelocity = -this.yVelocity;
        this.yVelocity = temp;
        this.moveX();
        this.moveY();
        this.moveZ();
    }
    moveLeft() {
        this.updateVelocities();
        const temp = this.yVelocity;
        this.yVelocity = -this.xVelocity;
        this.xVelocity = temp;
        this.moveX();
        this.moveY();
        this.moveZ();
    }
    rotateYaw(deg) {
        this._yaw += deg;
    }
    rotatePitch(deg) {
        this._pitch += deg;
    }
    moveBackward() {
        this.updateVelocities();
        this.xVelocity *= -1;
        this.yVelocity *= -1;
        this.zVelocity *= -1;
        this.moveX();
        this.moveY();
        this.moveZ();
    }
    moveX() {
        this._x += this.xVelocity;
        if (this.collideWithWall()) {
            this._x -= this.xVelocity;
        }
    }
    moveY() {
        this._y += this.yVelocity;
        if (this.collideWithWall()) {
            this._y -= this.yVelocity;
        }
    }
    moveZ() {
        this._z += this.zVelocity;
        if (this.collideWithWall()) {
            this._z -= this.zVelocity;
        }
    }
    updateVelocities() {
        this.horizontalSpeed = Math.cos(this._pitch) * this._speed;
        this.xVelocity = this.horizontalSpeed * Math.cos(this._yaw);
        this.yVelocity = this.horizontalSpeed * Math.sin(this._yaw);
        this.zVelocity = this._speed * Math.sin(this._pitch);
    }
    pointInWall(x, y, z) {
        const GAME_MAP = Game.instance.gameMap.map;
        const MAP_X = Math.floor(x / GameMap.tileSize);
        const MAP_Y = Math.floor(y / GameMap.tileSize);
        const MAP_Z = Math.floor(z / GameMap.tileSize);
        if (GAME_MAP[MAP_Z][MAP_Y][MAP_X] !== 0) {
            return true;
        }
        return false;
    }
    collideWithWall() {
        const VERTICES = [
            [this._x - this.size / 2, this._y - this.size / 2, this.z - this.size / 2],
            [this._x - this.size / 2, this._y + this.size / 2, this.z - this.size / 2],
            [this._x - this.size / 2, this._y + this.size / 2, this.z + this.size / 2],
            [this._x - this.size / 2, this._y - this.size / 2, this.z + this.size / 2],
            [this._x + this.size / 2, this._y - this.size / 2, this.z - this.size / 2],
            [this._x + this.size / 2, this._y + this.size / 2, this.z - this.size / 2],
            [this._x + this.size / 2, this._y - this.size / 2, this.z + this.size / 2],
            [this._x + this.size / 2, this._y + this.size / 2, this.z + this.size / 2],
        ];
        for (let vertex of VERTICES) {
            if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
                return true;
            }
        }
        return false;
    }
    castVisionRay(yaw, pitch) {
        let currentRayPositionX = this.x;
        let currentRayPositionY = this.y;
        let currentRayPositionZ = this.z;
        const RAY_X_VELOCITY = Math.cos(pitch) * Math.cos(yaw);
        const RAY_Y_VELOCITY = Math.cos(pitch) * Math.sin(yaw);
        const RAY_Z_VELOCITY = Math.sin(pitch);
        while (true) {
            // check ray's collision with map tiles (walls)
            //!!!!!!!!!!!!!!! Replace with one liner for performance if necessary
            const MAP_X = Math.floor(currentRayPositionX / GameMap.tileSize);
            const MAP_Y = Math.floor(currentRayPositionY / GameMap.tileSize);
            const MAP_Z = Math.floor(currentRayPositionZ / GameMap.tileSize);
            // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
            if (Game.instance.gameMap.map[MAP_Z][MAP_Y][MAP_X] != 0) {
                return Math.sqrt(Math.pow(currentRayPositionX - this.x, 2) +
                    Math.pow(currentRayPositionY - this.y, 2) +
                    Math.pow(currentRayPositionZ - this.z, 2));
            }
            // move the ray
            currentRayPositionX += RAY_X_VELOCITY;
            currentRayPositionY += RAY_Y_VELOCITY;
            currentRayPositionZ += RAY_Z_VELOCITY;
        }
    }
}
//# sourceMappingURL=Player.js.map