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

  private grounded: boolean = false;

  private maxPitch: number = Math.PI / 2
  
  
  // private xVelocity: number = Math.cos(this._pitch) * this._speed * Math.cos(this._yaw);
  // private yVelocity: number = Math.cos(this._pitch) * this._speed * Math.sin(this._yaw);
  // private zVelocity: number = this._speed * Math.sin(this._pitch)

  private xVelocity: number = this._speed * Math.cos(this._yaw);
  private yVelocity: number = this._speed * Math.sin(this._yaw);
  private zVelocity: number = 0
  
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
    this.move()
  }


  public moveRight(): void {
    this.updateVelocities();
    const temp: number = this.xVelocity;
    this.xVelocity = -this.yVelocity
    this.yVelocity = temp
    this.move()
  }


  public moveLeft(): void {
    this.updateVelocities();
    const temp: number = this.yVelocity;
    this.yVelocity = -this.xVelocity
    this.xVelocity = temp
    this.move()
  }


  public jump(): void {
    if (this.grounded) {
      this.zVelocity = -16
    }
  }


  public rotateYaw(deg: number): void {
    this._yaw += deg
  }

  public rotatePitch(deg: number): void {
    if (
      this._pitch + deg <= this.maxPitch  &&
      this._pitch + deg >= -this.maxPitch
    ) {
      this._pitch += deg
    }
  }


  public moveBackward(): void {
    this.updateVelocities()
    this.xVelocity *= -1
    this.yVelocity *= -1
    this.move()
  }

  public move(): void {
    this.moveX();
    this.moveY();
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
      if (this.zVelocity > 0) {
        this.grounded = true
      } else {
        this._z -= this.zVelocity;
        this.zVelocity = 0
        return
      }
      this._z -= this.zVelocity;
    } else {
      this.grounded = false
    }
  }


  public updateVelocities(): void {
    this.xVelocity = this._speed * Math.cos(this._yaw);
    this.yVelocity = this._speed * Math.sin(this._yaw);
  }

  public updateVerticalMovementDueToGravity(): void {
    if (!this.grounded) {
      if (Math.abs(this.zVelocity) <= Game.instance.terminalVelocity) {
        this.zVelocity += Game.instance.gravitationalAccelerationConstant;
      }
    } else if (this.zVelocity > 0) {
      this.zVelocity = 0
    }
    this.moveZ()
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
      [this._x - this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
      [this._x - this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
      [this._x - this.size / 2, this._y + this.size / 2, this._z + this.size / 2],
      [this._x - this.size / 2, this._y - this.size / 2, this._z + this.size / 2],
      [this._x + this.size / 2, this._y - this.size / 2, this._z - this.size / 2],
      [this._x + this.size / 2, this._y + this.size / 2, this._z - this.size / 2],
      [this._x + this.size / 2, this._y - this.size / 2, this._z + this.size / 2],
      [this._x + this.size / 2, this._y + this.size / 2, this._z + this.size / 2],
    ]
    for (let vertex of VERTICES) {
      if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
        return true;
      }
    }
    return false;
  }



  public castVisionRay(yaw: number, pitch: number): number[] {
    let currentRayPositionX: number = this._x;
    let currentRayPositionY: number = this._y;
    let currentRayPositionZ: number = this._z;

    const RAY_VELOCITY_X: number = Math.cos(pitch) * Math.cos(yaw)
    const RAY_VELOCITY_Y: number = Math.cos(pitch) * Math.sin(yaw)
    const RAY_VELOCITY_Z: number = Math.sin(pitch)


    while (true) {
 
      // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
      if (
        Game.instance.gameMap.map
        [Math.floor(currentRayPositionZ / GameMap.tileSize)]
        [Math.floor(currentRayPositionY / GameMap.tileSize)]
        [Math.floor(currentRayPositionX / GameMap.tileSize)] === 1
      ) {
        let pixelColorCode: number;


        const RETRACED_X = currentRayPositionX - RAY_VELOCITY_X
        const RETRACED_Y = currentRayPositionY - RAY_VELOCITY_Y

        if (
          Game.instance.gameMap.map
          [Math.floor(currentRayPositionZ / GameMap.tileSize)]
          [Math.floor(currentRayPositionY / GameMap.tileSize)]
          [Math.floor(RETRACED_X / GameMap.tileSize)] === 0
        ) {
          // the change in x is what made it it, calculate the position hit based on the y and z
          const HIT_Y: number = currentRayPositionY % GameMap.tileSize
          const HIT_Z: number = currentRayPositionZ % GameMap.tileSize

          pixelColorCode = GameMap.wallTexture[Math.floor(HIT_Y / GameMap.wallBitSize)][Math.floor(HIT_Z / GameMap.wallBitSize)]
        } else if (
          Game.instance.gameMap.map
          [Math.floor(currentRayPositionZ / GameMap.tileSize)]
          [Math.floor(RETRACED_Y / GameMap.tileSize)]
          [Math.floor(currentRayPositionX / GameMap.tileSize)] === 0
        ) {
          // the change in y is what made it it, calculate the position hit based on the x and z
          const HIT_X: number = currentRayPositionX % GameMap.tileSize
          const HIT_Z: number = currentRayPositionZ % GameMap.tileSize

          pixelColorCode = GameMap.wallTexture[Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Z / GameMap.wallBitSize)]
        } else {
          // the change in y is what made it it, calculate the position hit based on the x and z
          const HIT_X: number = currentRayPositionX % GameMap.tileSize
          const HIT_Y: number = currentRayPositionY % GameMap.tileSize

          pixelColorCode = GameMap.wallTexture[Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]

        }

        return [
          Math.sqrt(
          Math.pow(currentRayPositionX - this._x, 2) +
          Math.pow(currentRayPositionY - this._y, 2) + 
          Math.pow(currentRayPositionZ - this._z, 2)
          ), 
          pixelColorCode!
        ]
      }

      // move the ray 1 unit in the unit vector's direction
      currentRayPositionX += RAY_VELOCITY_X
      currentRayPositionY += RAY_VELOCITY_Y
      currentRayPositionZ += RAY_VELOCITY_Z
    }
  }
}