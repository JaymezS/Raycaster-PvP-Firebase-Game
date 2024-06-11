"use strict";
class Player {
    // note that x and y are center values
    _x = GameMap.tileSize * 1.5;
    _y = GameMap.tileSize * 1.5;
    size = 32;
    _angle = 0;
    _speed = 3;
    _rotationSpeed = Math.PI / 180;
    _fov = Math.PI / 3; // Field of view
    xVelocity = this.speed * Math.cos(this._angle);
    yVelocity = this.speed * Math.sin(this._angle);
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
        this.updateVelocities();
        this.moveX();
        this.moveY();
    }
    moveBackward() {
        this.updateVelocities();
        this.xVelocity *= -1;
        this.yVelocity *= -1;
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
    rotateRight() {
        this._angle += this.rotationSpeed;
    }
    rotateLeft() {
        this._angle -= this.rotationSpeed;
    }
    updateVelocities() {
        this.xVelocity = this.speed * Math.cos(this._angle);
        this.yVelocity = this.speed * Math.sin(this._angle);
    }
    collideWithWall() {
        const GAME_MAP = Game.instance.gameMap.map;
        for (let i = 0; i < GAME_MAP.length; i++) {
            for (let j = 0; j < GAME_MAP[0].length; j++) {
                if (GAME_MAP[i][j] !== 0) {
                    const TILE_LEFT_BOUND = j * GameMap.tileSize;
                    const TILE_RIGHT_BOUND = (j + 1) * GameMap.tileSize;
                    const TILE_UP_BOUND = i * GameMap.tileSize;
                    const TILE_DOWN_BOUND = (i + 1) * GameMap.tileSize;
                    if (this.x + this.size / 2 > TILE_LEFT_BOUND &&
                        this.x - this.size / 2 < TILE_RIGHT_BOUND &&
                        this.y - this.size / 2 < TILE_DOWN_BOUND &&
                        this.y + this.size / 2 > TILE_UP_BOUND) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    castVisionRay(angle) {
        let currentRayPositionX = this.x;
        let currentRayPositionY = this.y;
        let distanceTravelledX = 0;
        let distanceTravelledY = 0;
        const RAY_DIRECTION_X = Math.cos(angle);
        const RAY_DIRECTION_Y = Math.sin(angle);
        while (true) {
            // check ray's collision with map tiles (walls)
            const MAP_X = Math.floor(currentRayPositionX / GameMap.tileSize);
            const MAP_Y = Math.floor(currentRayPositionY / GameMap.tileSize);
            // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
            if (Game.instance.gameMap.map[MAP_Y][MAP_X] === 1) {
                let textureX = 0;
                const hitX = (currentRayPositionX - MAP_X * GameMap.tileSize) % GameMap.tileSize;
                const hitY = (currentRayPositionY - MAP_Y * GameMap.tileSize) % GameMap.tileSize;
                const BACKTRACK_RAY_X = currentRayPositionX - RAY_DIRECTION_X;
                const BACKTRACK_MAP_X = Math.floor(BACKTRACK_RAY_X / GameMap.tileSize);
                // if by backtracking x, the ray no longer hits, then x is what made it hit, so it's a collision in the x direction
                if (Game.instance.gameMap.map[MAP_Y][BACKTRACK_MAP_X] === 0) {
                    textureX = hitY;
                }
                else {
                    textureX = hitX;
                }
                return [
                    Math.sqrt(Math.pow(distanceTravelledX, 2) + Math.pow(distanceTravelledY, 2)),
                    textureX
                ];
            }
            // move the ray
            distanceTravelledX += RAY_DIRECTION_X;
            distanceTravelledY += RAY_DIRECTION_Y;
            currentRayPositionX += RAY_DIRECTION_X;
            currentRayPositionY += RAY_DIRECTION_Y;
        }
    }
}
//# sourceMappingURL=Player.js.map