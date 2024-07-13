/**
 * keep track of ammo for the player
 */
class AmmoGauge {
  private _gauge: number = 100;
  readonly maxGauge: number = 100;

  /**
   * the limit below which ammo cannot be used
   */
  readonly usableLimit: number = 40;
  readonly regenerationSpeed: number = 0.2;

  public get gauge(): number {
    return this._gauge;
  }

  public get hasFuel(): boolean {
    return this._gauge > 0;
  }

  public canUseFuel(n: number): boolean {
    return this._gauge >= n;
  }

  public useFuel(n: number): void {
    this._gauge -= n;
    if (this._gauge < 0) {
      this._gauge = 0;
    }
  }

  /**
   * check if the fuel is above the usable limit
   */
  public get canUse(): boolean {
    return this._gauge >= this.usableLimit;
  }

  public regenerateFuel(): void {
    if (this.canUse) {
      this._gauge += this.regenerationSpeed * 5;
    } else {
      this._gauge += this.regenerationSpeed * 2;
    }
    if (this._gauge > this.maxGauge) {
      this._gauge = this.maxGauge;
    }
  }
}


export {AmmoGauge}