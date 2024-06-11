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
    grounded = false;
    maxPitch = Math.PI / 4;
    // private xVelocity: number = Math.cos(this._pitch) * this._speed * Math.cos(this._yaw);
    // private yVelocity: number = Math.cos(this._pitch) * this._speed * Math.sin(this._yaw);
    // private zVelocity: number = this._speed * Math.sin(this._pitch)
    xVelocity = Math.cos(this._pitch) * this._speed * Math.cos(this._yaw);
    yVelocity = Math.cos(this._pitch) * this._speed * Math.sin(this._yaw);
    zVelocity = 0;
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
        this.move();
    }
    moveRight() {
        this.updateVelocities();
        const temp = this.xVelocity;
        this.xVelocity = -this.yVelocity;
        this.yVelocity = temp;
        this.move();
    }
    moveLeft() {
        this.updateVelocities();
        const temp = this.yVelocity;
        this.yVelocity = -this.xVelocity;
        this.xVelocity = temp;
        this.move();
    }
    jump() {
        if (this.grounded) {
            this.zVelocity = -20;
        }
    }
    rotateYaw(deg) {
        this._yaw += deg;
    }
    rotatePitch(deg) {
        if (this._pitch + deg <= this.maxPitch &&
            this._pitch + deg >= -this.maxPitch) {
            this._pitch += deg;
        }
    }
    moveBackward() {
        this.updateVelocities();
        this.xVelocity *= -1;
        this.yVelocity *= -1;
        this.move();
    }
    move() {
        this.moveX();
        this.moveY();
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
            if (this.zVelocity > 0) {
                this.grounded = true;
            }
            this._z -= this.zVelocity;
        }
        else {
            this.grounded = false;
        }
    }
    updateVelocities() {
        this.xVelocity = Math.cos(this._pitch) * this._speed * Math.cos(this._yaw);
        this.yVelocity = Math.cos(this._pitch) * this._speed * Math.sin(this._yaw);
    }
    updateVerticalMovementDueToGravity() {
        if (!this.grounded) {
            if (Math.abs(this.zVelocity) <= Game.instance.terminalVelocity) {
                this.zVelocity += Game.instance.gravitationalAccelerationConstant;
            }
        }
        else if (this.zVelocity > 0) {
            this.zVelocity = 0;
        }
        this.moveZ();
    }
    pointInWall(x, y, z) {
        if (Game.instance.gameMap.map[Math.floor(z / GameMap.tileSize)][Math.floor(y / GameMap.tileSize)][Math.floor(x / GameMap.tileSize)] !== 0) {
            return true;
        }
        return false;
    }
    collideWithWall() {
        const VERTICES = [
            [this._x - this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
            [this._x - this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
            [this._x - this.size / 2, this._y + this.size / 2, this._z + this.size / 2],
            [this._x - this.size / 2, this._y - this.size / 2, this._z + this.size / 2],
            [this._x + this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
            [this._x + this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
            [this._x + this.size / 2, this._y - this.size / 2, this._z + this.size / 2],
            [this._x + this.size / 2, this._y + this.size / 2, this._z + this.size / 2],
        ];
        for (let vertex of VERTICES) {
            if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
                return true;
            }
        }
        return false;
    }
    castVisionRay(yaw, pitch) {
        let currentRayPositionX = this._x;
        let currentRayPositionY = this._y;
        let currentRayPositionZ = this._z;
        const RAY_VELOCITY_X = Math.cos(pitch) * Math.cos(yaw);
        const RAY_VELOCITY_Y = Math.cos(pitch) * Math.sin(yaw);
        const RAY_VELOCITY_Z = Math.sin(pitch);
        while (true) {
            // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
            if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(currentRayPositionY / GameMap.tileSize)][Math.floor(currentRayPositionX / GameMap.tileSize)] === 1) {
                let pixelColorCode;
                const RETRACED_X = currentRayPositionX - RAY_VELOCITY_X;
                const RETRACED_Y = currentRayPositionY - RAY_VELOCITY_Y;
                if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(currentRayPositionY / GameMap.tileSize)][Math.floor(RETRACED_X / GameMap.tileSize)] === 0) {
                    // the change in x is what made it it, calculate the position hit based on the y and z
                    const HIT_Y = currentRayPositionY % GameMap.tileSize;
                    const HIT_Z = currentRayPositionZ % GameMap.tileSize;
                    pixelColorCode = GameMap.wallTexture[Math.floor(HIT_Y / GameMap.wallBitSize)][Math.floor(HIT_Z / GameMap.wallBitSize)];
                }
                else if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(RETRACED_Y / GameMap.tileSize)][Math.floor(currentRayPositionX / GameMap.tileSize)] === 0) {
                    // the change in y is what made it it, calculate the position hit based on the x and z
                    const HIT_X = currentRayPositionX % GameMap.tileSize;
                    const HIT_Z = currentRayPositionZ % GameMap.tileSize;
                    pixelColorCode = GameMap.wallTexture[Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Z / GameMap.wallBitSize)];
                }
                else {
                    // the change in y is what made it it, calculate the position hit based on the x and z
                    const HIT_X = currentRayPositionX % GameMap.tileSize;
                    const HIT_Y = currentRayPositionY % GameMap.tileSize;
                    pixelColorCode = GameMap.wallTexture[Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)];
                }
                return [
                    Math.sqrt(Math.pow(currentRayPositionX - this._x, 2) +
                        Math.pow(currentRayPositionY - this._y, 2) +
                        Math.pow(currentRayPositionZ - this._z, 2)),
                    pixelColorCode
                ];
            }
            // move the ray 1 unit in the unit vector's direction
            currentRayPositionX += RAY_VELOCITY_X;
            currentRayPositionY += RAY_VELOCITY_Y;
            currentRayPositionZ += RAY_VELOCITY_Z;
        }
    }
}
//# sourceMappingURL=Player.js.map