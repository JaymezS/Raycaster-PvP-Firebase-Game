//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Game } from "./Game.js";
class Laser {
    static damage = 0.1;
    _position;
    _directionVector;
    _sourcePlayerID;
    isOn = false;
    fuelCost = 1;
    id = nanoid(20);
    get sourcePlayerID() {
        return this._sourcePlayerID;
    }
    get position() {
        return this._position;
    }
    get directionVector() {
        return this._directionVector;
    }
    constructor(player) {
        this._directionVector = player.directionVector;
        this._position = player.position;
        this._sourcePlayerID = player.id;
    }
    adjustToPlayer(p) {
        this._position = p.position;
        this._directionVector = p.directionVector;
    }
    useFuel() {
        if (Game.instance.player.ammoGauge.canUseFuel(this.fuelCost)) {
            Game.instance.player.ammoGauge.useFuel(this.fuelCost);
            if (!Game.instance.player.ammoGauge.hasFuel) {
                this.isOn = false;
            }
        }
        else {
            this.isOn = false;
        }
    }
}
export { Laser };
//# sourceMappingURL=Laser.js.map