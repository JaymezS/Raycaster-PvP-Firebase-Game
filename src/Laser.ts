import { Vector, Position } from "./Vector.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

class Laser {
  public static damage: number = 0.1;
  private _position: Position;
  private _directionVector: Vector;
  private _sourcePlayerID: string;
  public isOn: boolean = false;
  readonly fuelCost: number = 1;

  readonly id: string = nanoid(20);

  public get sourcePlayerID(): string {
    return this._sourcePlayerID;
  }
  public get position(): Position {
    return this._position;
  }

  public get directionVector(): Vector {
    return this._directionVector;
  }
  constructor(
    player: Player
  ) { 
    this._directionVector = player.directionVector;
    this._position = player.position;
    this._sourcePlayerID = player.id;
  }


  public adjustToPlayer(p: Player): void {
    this._position = p.position;
    this._directionVector = p.directionVector;
  }


  public useFuel(): void {
    if (Game.instance.player.ammoGauge.canUseFuel(this.fuelCost)) {
      Game.instance.player.ammoGauge.useFuel(this.fuelCost);
      if (!Game.instance.player.ammoGauge.hasFuel) {
        this.isOn = false;
      }
    } else {
      this.isOn = false;
    }
  }
}


export { Laser }