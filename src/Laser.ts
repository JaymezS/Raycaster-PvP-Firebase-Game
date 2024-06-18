import { Vector, Position } from "./Vector.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

class Laser {
  public static damage: number = 0.1
  protected _position: Position
  protected _directionVector: Vector
  protected _sourcePlayerID: string
  protected _isOn: boolean = false;
  readonly fuelCost: number = 1

  readonly id: string = nanoid(20);

  public get isOn(): boolean {
    return this._isOn
  }
  public set isOn(n: boolean) {
    this._isOn = n;
  }
  public get sourcePlayerID(): string {
    return this._sourcePlayerID;
  }
  public get position(): Position {
    return this._position
  }

  public get directionVector(): Vector {
    return this._directionVector
  }
  constructor(
    player: Player
  ) { 
    this._directionVector = player.directionVector
    this._position = player.position;
    this._sourcePlayerID = player.id
  }


  public adjustToPlayer(p: Player) {
    this._position = p.position;
    this._directionVector = p.directionVector;
  }


  public useFuel(): void {
    if (Game.instance.player.ammoGauge.canUseFuel(this.fuelCost)) {
      Game.instance.player.ammoGauge.useFuel(this.fuelCost)
      if (!Game.instance.player.ammoGauge.hasFuel) {
        this._isOn = false
      }
    }
  }
}


export { Laser }