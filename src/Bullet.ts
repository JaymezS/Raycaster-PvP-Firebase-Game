import { Vector, VectorMath } from "./Vector.js";
import { Player } from "./Player.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Game } from "./Game.js";
import { GameMap } from "./Map.js";

class Bullet {
  public static damage: number = 2
  public static size: number = 10;
  public static color: number = 0;
  public static fuelCost: number = 40;
  protected speed: number = 20;
  private velocityVector: Vector;
  protected _x: number;
  protected _y: number;
  protected _z: number;
  protected _id: string = nanoid(25)
  protected size: number = Bullet.size

  public get x(): number {
    return this._x
  }

  
  public get y(): number {
    return this._y
  }

  
  public get z(): number {
    return this._z
  }


  public get id(): string {
    return this._id
  }


  public get sourcePlayerID(): string {
    return this._player.id
  }

  constructor(
    protected _player: Player,
  ) {
    this.velocityVector = VectorMath.convertUnitVectorToVector(this._player.directionVector, this.speed)
    this._x = this._player.x
    this._y = this._player.y
    this._z = this._player.z - Player.size/2
  }

  public updatePosition() {
    this._x += this.velocityVector[0]
    this._y += this.velocityVector[1]
    this._z += this.velocityVector[2]
  }

  public pointInWall(x: number, y: number, z: number) {
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


  public collideWithWall(): boolean {
    const VERTICES: number[][] = [
      [this._x + this.size / 2, this._y - this.size / 2, this._z + this.size /2 ],
      [this._x + this.size / 2, this._y + this.size / 2, this._z + this.size /2 ],
      [this._x - this.size / 2, this._y + this.size / 2, this._z + this.size /2 ],
      [this._x - this.size / 2, this._y - this.size / 2, this._z + this.size /2 ],
      [this._x + this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
      [this._x + this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
      [this._x - this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
      [this._x - this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
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