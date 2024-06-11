class Player {
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private _angle: number = 0
  private _speed: number = 3
  private _rotationSpeed: number = 0.05
  private _fov = Math.PI / 3; // Field of view
  
  public get x(): number {
    return this._x
  }
  public get y(): number {
    return this._y
  }
  public get angle(): number {
    return this._angle
  }
  public get speed(): number {
    return this._speed
  }
  public get fov(): number {
    return this._fov
  }
  public get rotationSpeed(): number {
    return this._rotationSpeed
  }

  public set angle(angle: number) {
    this._angle = angle
  }

  public moveForward(): void {
    this._x += this.speed * Math.cos(this.angle);
    this._y += this.speed * Math.sin(this.angle);
  }

  public moveBackward(): void {
    this._x -= this.speed * Math.cos(this.angle);
    this._y -= this.speed * Math.sin(this.angle);
  }
}