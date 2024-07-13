import { Vector, VectorMath } from "./Vector.js";
import { Player } from "./Player.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Game } from "./Game.js";
import { GameMap } from "./Map.js";

class Bullet {
  public static damage: number = 2;
  public static size: number = 10;
  public static color: number = 0;
  public static fuelCost: number = 40;
  private speed: number = 20;
  private velocityVector: Vector;
  private _x: number;
  private _y: number;
  private _z: number;
  readonly id: string = nanoid(25);

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get z(): number {
    return this._z;
  }

  /** get the id of the source player */
  public get sourcePlayerID(): string {
    return this._player.id;
  }

  constructor(
    private _player: Player,
  ) {
    this.velocityVector = VectorMath.convertUnitVectorToVector(this._player.directionVector, this.speed);
    this._x = this._player.x;
    this._y = this._player.y;
    this._z = this._player.z - Player.size / 2;
  }


  public updatePosition(): void {
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
  private pointInWall(x: number, y: number, z: number): boolean {
    if (
      Game.instance.gameMap.map
      [Math.floor(z / GameMap.tileSize)]
      [Math.floor(y / GameMap.tileSize)]
      [Math.floor(x / GameMap.tileSize)] !== 0
    ) {
      return true;
    }
    return false;
  }


  /**
   * 
   * @returns true if bullet collided with wall, false if not
   */
  public collideWithWall(): boolean {
    const VERTICES: number[][] = [
      [this._x + Bullet.size / 2, this._y - Bullet.size / 2, this._z + Bullet.size /2 ],
      [this._x + Bullet.size / 2, this._y + Bullet.size / 2, this._z + Bullet.size /2 ],
      [this._x - Bullet.size / 2, this._y + Bullet.size / 2, this._z + Bullet.size /2 ],
      [this._x - Bullet.size / 2, this._y - Bullet.size / 2, this._z + Bullet.size /2 ],
      [this._x + Bullet.size / 2, this._y - Bullet.size / 2, this._z - Bullet.size / 2],
      [this._x + Bullet.size / 2, this._y + Bullet.size / 2, this._z - Bullet.size / 2],
      [this._x - Bullet.size / 2, this._y - Bullet.size / 2, this._z - Bullet.size / 2],
      [this._x - Bullet.size / 2, this._y + Bullet.size / 2, this._z - Bullet.size / 2],
    ]
    for (let vertex of VERTICES) {
      if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
        return true;
      }
    }
    return false;
  }
}


export {Bullet}