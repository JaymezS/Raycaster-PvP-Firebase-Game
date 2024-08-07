/**
 * keep track of ammo for the player
 */
class AmmoGauge {
    _gauge = 100;
    maxGauge = 100;
    /**
     * the limit below which ammo cannot be used
     */
    usableLimit = 40;
    regenerationSpeed = 0.2;
    get gauge() {
        return this._gauge;
    }
    get hasFuel() {
        return this._gauge > 0;
    }
    canUseFuel(n) {
        return this._gauge >= n;
    }
    useFuel(n) {
        this._gauge -= n;
        if (this._gauge < 0) {
            this._gauge = 0;
        }
    }
    /**
     * check if the fuel is above the usable limit
     */
    get canUse() {
        return this._gauge >= this.usableLimit;
    }
    regenerateFuel() {
        if (this.canUse) {
            this._gauge += this.regenerationSpeed * 5;
        }
        else {
            this._gauge += this.regenerationSpeed * 2;
        }
        if (this._gauge > this.maxGauge) {
            this._gauge = this.maxGauge;
        }
    }
}
export { AmmoGauge };
//# sourceMappingURL=Ammunition.js.map