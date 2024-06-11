class Player {
  // note that x and y are center values
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private _z: number = GameMap.tileSize * 1.5
  private size: number = 32
  private _yaw: number = 0;
  private _pitch: number = 0;
  private _speed: number = 3
  private _rotationSpeed: number = Math.PI/180
  private _fov = Math.PI / 4; // Field of view

  private horizontalSpeed: number = Math.cos(this._pitch) * this._speed;
  private xVelocity: number = this.horizontalSpeed * Math.cos(this._yaw);
  private yVelocity: number = this.horizontalSpeed * Math.sin(this._yaw);
  private zVelocity: number = this._speed * Math.sin(this._pitch)
  
  public get x(): number {
    return this._x
  }
  public get y(): number {
    return this._y
  }
  public get z(): number {
    return this._z
  }
  public get yaw(): number {
    return this._yaw
  }
  public get pitch(): number {
    return this._pitch
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

  public set yaw(angle: number) {
    this._yaw = angle
  }
  public set pitch(angle: number) {
    this._pitch = angle
  }

  public moveForward(): void {
    this.updateVelocities()
    this.moveX()
    this.moveY()
    this.moveZ()
  }


  public moveRight(): void {
    this.updateVelocities();
    const temp: number = this.xVelocity;
    this.xVelocity = -this.yVelocity
    this.yVelocity = temp
    this.moveX()
    this.moveY()
    this.moveZ()
  }


  public moveLeft(): void {
    this.updateVelocities();
    const temp: number = this.yVelocity;
    this.yVelocity = -this.xVelocity
    this.xVelocity = temp
    this.moveX()
    this.moveY()
    this.moveZ()
  }


  public rotateYaw(deg: number): void {
    this._yaw += deg
  }
  public rotatePitch(deg: number): void {
    this._pitch += deg
  }


  public moveBackward(): void {
    this.updateVelocities()
    this.xVelocity *= -1
    this.yVelocity *= -1
    this.zVelocity *= -1
    this.moveX()
    this.moveY()
    this.moveZ()
  }

  public moveX(): void {
    this._x += this.xVelocity
    if (this.collideWithWall()) {
      this._x -= this.xVelocity
    }
  }

  public moveY(): void {
    this._y += this.yVelocity
    if (this.collideWithWall()) {
      this._y -= this.yVelocity
    }
  }

  public moveZ(): void {
    this._z += this.zVelocity
    if (this.collideWithWall()) {
      this._z -= this.zVelocity;
    }
  }


  public updateVelocities(): void {
    this.horizontalSpeed = Math.cos(this._pitch) * this._speed;
    this.xVelocity = this.horizontalSpeed * Math.cos(this._yaw);
    this.yVelocity = this.horizontalSpeed * Math.sin(this._yaw);
    this.zVelocity = this._speed * Math.sin(this._pitch)
  }

  public pointInWall(x: number, y: number, z: number) {
    const GAME_MAP: number[][][] = Game.instance.gameMap.map

    const MAP_X: number = Math.floor(x / GameMap.tileSize);
    const MAP_Y: number = Math.floor(y / GameMap.tileSize);
    const MAP_Z: number = Math.floor(z / GameMap.tileSize);

    if (GAME_MAP[MAP_Z][MAP_Y][MAP_X] !== 0) {
      return true;
    }
    return false;
  }

  public collideWithWall(): boolean {
    const VERTICES: number[][] = [
      [this._x - this.size / 2, this._y - this.size / 2, this.z - this.size / 2],
      [this._x - this.size / 2, this._y + this.size / 2, this.z - this.size / 2],
      [this._x - this.size / 2, this._y + this.size / 2, this.z + this.size / 2],
      [this._x - this.size / 2, this._y - this.size / 2, this.z + this.size / 2],
      [this._x + this.size / 2, this._y - this.size / 2, this.z - this.size / 2],
      [this._x + this.size / 2, this._y + this.size / 2, this.z - this.size / 2],
      [this._x + this.size / 2, this._y - this.size / 2, this.z + this.size / 2],
      [this._x + this.size / 2, this._y + this.size / 2, this.z + this.size / 2],
    ]
    for (let vertex of VERTICES) {
      if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
        return true;
      }
    }
    return false;
  }

  public castVisionRay(yaw: number, pitch: number): number {
    let currentRayPositionX: number = this.x;
    let currentRayPositionY: number = this.y;
    let currentRayPositionZ: number = this.z;

    const RAY_X_VELOCITY = Math.cos(pitch) * Math.cos(yaw);
    const RAY_Y_VELOCITY = Math.cos(pitch) * Math.sin(yaw);
    const RAY_Z_VELOCITY = Math.sin(pitch)

    while (true) {
      // check ray's collision with map tiles (walls)

      //!!!!!!!!!!!!!!! Replace with one liner for performance if necessary
      const MAP_X = Math.floor(currentRayPositionX / GameMap.tileSize);
      const MAP_Y = Math.floor(currentRayPositionY / GameMap.tileSize);
      const MAP_Z = Math.floor(currentRayPositionZ / GameMap.tileSize);
      // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
      if (Game.instance.gameMap.map[MAP_Z][MAP_Y][MAP_X] != 0) {

        return Math.sqrt(
          Math.pow(currentRayPositionX - this.x, 2) +
          Math.pow(currentRayPositionY - this.y, 2) + 
          Math.pow(currentRayPositionZ - this.z, 2)
        )
      }

      // move the ray
      currentRayPositionX += RAY_X_VELOCITY
      currentRayPositionY += RAY_Y_VELOCITY
      currentRayPositionZ += RAY_Z_VELOCITY
    }
  }
}