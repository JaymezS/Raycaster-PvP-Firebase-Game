import { VectorMath } from "./Vector.js";
import { Player } from "./Player.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Game } from "./Game.js";
import { GameMap } from "./Map.js";
class Bullet {
    _player;
    static damage = 2;
    static size = 10;
    static color = 0;
    static fuelCost = 40;
    speed = 20;
    velocityVector;
    _x;
    _y;
    _z;
    id = nanoid(25);
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get z() {
        return this._z;
    }
    /** get the id of the source player */
    get sourcePlayerID() {
        return this._player.id;
    }
    constructor(_player) {
        this._player = _player;
        this.velocityVector = VectorMath.convertUnitVectorToVector(this._player.directionVector, this.speed);
        this._x = this._player.x;
        this._y = this._player.y;
        this._z = this._player.z - Player.size / 2;
    }
    updatePosition() {
        this._x += this.velocityVector[0];
        this._y += this.velocityVector[1];
        this._z += this.velocityVector[2];
    }
    /**
     *  check if the given point (x, y, z) is inside the blocks in the map
     * @param x
     * @param y
     * @param z
     * @returns true if it is, false if it is not
     */
    pointInWall(x, y, z) {
        if (Game.instance.gameMap.map[Math.floor(z / GameMap.tileSize)][Math.floor(y / GameMap.tileSize)][Math.floor(x / GameMap.tileSize)] !== 0) {
            return true;
        }
        return false;
    }
    /**
     *
     * @returns true if bullet collided with wall, false if not
     */
    collideWithWall() {
        const VERTICES = [
            [this._x + Bullet.size / 2, this._y - Bullet.size / 2, this._z + Bullet.size / 2],
            [this._x + Bullet.size / 2, this._y + Bullet.size / 2, this._z + Bullet.size / 2],
            [this._x - Bullet.size / 2, this._y + Bullet.size / 2, this._z + Bullet.size / 2],
            [this._x - Bullet.size / 2, this._y - Bullet.size / 2, this._z + Bullet.size / 2],
            [this._x + Bullet.size / 2, this._y - Bullet.size / 2, this._z - Bullet.size / 2],
            [this._x + Bullet.size / 2, this._y + Bullet.size / 2, this._z - Bullet.size / 2],
            [this._x - Bullet.size / 2, this._y - Bullet.size / 2, this._z - Bullet.size / 2],
            [this._x - Bullet.size / 2, this._y + Bullet.size / 2, this._z - Bullet.size / 2],
        ];
        for (let vertex of VERTICES) {
            if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
                return true;
            }
        }
        return false;
    }
}
export { Bullet };
//# sourceMappingURL=Bullet.js.map