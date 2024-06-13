import { UpdatePlayerPositionToFirebaseCommand } from "./Command.js"
import { Game } from "./Game.js"
import { GameMap, Colors, PIXEL_COLORS } from "./Map.js"
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Utilities } from "./Utilities.js";

class Player {

  public static size: number = 56
  // note that x and y are center values
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private _z: number = GameMap.tileSize * 2
  private size: number = Player.size
  private _yaw: number = 0;
  private _pitch: number = 0;
  private _speed: number = 0
  private _rotationSpeed: number = Math.PI/180
  private _fov = Math.PI / 2; // Field of view
  public colorCode: number = Utilities.randInt(0, PIXEL_COLORS.length)
  readonly acceleration: number = 3
  readonly maxMovingSpeed: number = 5

  readonly id: string = nanoid(20);


  private grounded: boolean = false;

  private maxPitch: number = Math.PI / 2

  private xVelocity: number = 0;
  private yVelocity: number = 0;
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


  public jump(): void {
    if (this.grounded) {
      this.zVelocity = 16
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


  public accelerateLeft(): void {
    this.xVelocity += this.acceleration * Math.sin(this._yaw);
    this.yVelocity -= this.acceleration * Math.cos(this._yaw);

    this.xVelocity = this.acceleration * Math.sin(this._yaw);
    this.yVelocity = -this.acceleration * Math.cos(this._yaw);
  }
  public accelerateForward(): void {
    this.xVelocity += this.acceleration * Math.cos(this._yaw);
    this.yVelocity += this.acceleration * Math.sin(this._yaw);

    this.xVelocity = this.acceleration * Math.cos(this._yaw);
    this.yVelocity = this.acceleration * Math.sin(this._yaw);
  }
  public accelerateRight(): void {
    this.xVelocity -= this.acceleration * Math.sin(this._yaw);
    this.yVelocity += this.acceleration * Math.cos(this._yaw);

    this.xVelocity = -this.acceleration * Math.sin(this._yaw);
    this.yVelocity = this.acceleration * Math.cos(this._yaw);
  }
  public accelerateBackward(): void {
    this.xVelocity -= this.acceleration * Math.cos(this._yaw);
    this.yVelocity -= this.acceleration * Math.sin(this._yaw);

    this.xVelocity = -this.acceleration * Math.cos(this._yaw);
    this.yVelocity = -this.acceleration * Math.sin(this._yaw);
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
      if (this.zVelocity < 0) {
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
    new UpdatePlayerPositionToFirebaseCommand(this).execute()
  }

  public updatePosition(): void {
    this.moveX()
    this.moveY()
    this.updateVerticalMovementDueToGravity()
    new UpdatePlayerPositionToFirebaseCommand(this).execute()
  }


  public updateVerticalMovementDueToGravity(): void {
    if (!this.grounded) {
      if (this.zVelocity <= -Game.instance.terminalVelocity) {
        this.zVelocity = -Game.instance.terminalVelocity
      } else {
        this.zVelocity -= Game.instance.gravitationalAccelerationConstant;
      }
    } else if (this.zVelocity < 0) {
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

  public pointInCharacterAtLocation(px: number, py: number, pz: number, cx: number, cy: number, cz: number): boolean {
    if (
      px >= cx - Player.size / 2 &&
      px <= cx + Player.size / 2 &&
      py >= cy - Player.size / 2 &&
      py <= cy + Player.size / 2 &&
      pz <= cz &&
      pz >= cz - Player.size
    ) {
      return true;
    }
    return false
  }


  public collideWithWall(): boolean {
    const VERTICES: number[][] = [
      [this._x + this.size / 2, this._y - this.size / 2, this._z],
      [this._x + this.size / 2, this._y + this.size / 2, this._z],
      [this._x - this.size / 2, this._y + this.size / 2, this._z],
      [this._x - this.size / 2, this._y - this.size / 2, this._z],
      [this._x + this.size / 2, this._y - this.size / 2, this._z - this.size],
      [this._x + this.size / 2, this._y + this.size / 2, this._z - this.size],
      [this._x - this.size / 2, this._y - this.size / 2, this._z - this.size],
      [this._x - this.size / 2, this._y + this.size / 2, this._z - this.size],
    ]
    for (let vertex of VERTICES) {
      if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
        return true;
      }
    }
    return false;
  }



  public castBlockVisionRay2(yaw: number, pitch: number): number[] {
    let currentRayPositionX: number = this._x;
    let currentRayPositionY: number = this._y;
    let currentRayPositionZ: number = this._z;

    const RAY_VELOCITY_X: number = Math.cos(pitch) * Math.cos(yaw)
    const RAY_VELOCITY_Y: number = Math.cos(pitch) * Math.sin(yaw)
    const RAY_VELOCITY_Z: number = Math.sin(pitch)

    // calculate collsion in x direction
    const Y_OFFSET: number = GameMap.tileSize;

    // 8:40: optimized algorithm to skip empty blocks
    // https://www.youtube.com/watch?v=gYRrGTC7GtA&t=3s
    return []
  }


  public castBlockVisionRay(yaw: number, pitch: number): number[] {

    // cheap way to increase performance by increasing the ray cast speed, it does reduce accuracy of render tho
    // 4-5 is the limit, any higher and graphics will be completely innaccurate
    // remove this method later, try  to use castBlockVisionRay2 if possible
    // higher # = more innaccurate graphics
    const RAY_SPEED: number = 5;

    let currentRayPositionX: number = this._x;
    let currentRayPositionY: number = this._y;
    let currentRayPositionZ: number = this._z;

    const RAY_VELOCITY_X: number = RAY_SPEED * Math.cos(pitch) * Math.cos(yaw)
    const RAY_VELOCITY_Y: number = RAY_SPEED * Math.cos(pitch) * Math.sin(yaw)
    const RAY_VELOCITY_Z: number = RAY_SPEED * Math.sin(pitch)

    const CHARACTERS_POSITIONS: {x: number, y: number, z: number, color: number}[] = Object.values(Game.instance.otherPlayers)

    while (true) {

      let rayhitCharacter: boolean = false;
      let hitColor: number = undefined;
      for (let char of CHARACTERS_POSITIONS) {
        if (
          this.pointInCharacterAtLocation(
            currentRayPositionX,
            currentRayPositionY,
            currentRayPositionZ,
            char.x,
            char.y,
            char.z
          )
        ) {
          rayhitCharacter = true;
          hitColor = char.color
        }
      }
 
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
          const HIT_Z: number = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize)

          pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
        } else if (
          Game.instance.gameMap.map
          [Math.floor(currentRayPositionZ / GameMap.tileSize)]
          [Math.floor(RETRACED_Y / GameMap.tileSize)]
          [Math.floor(currentRayPositionX / GameMap.tileSize)] === 0
        ) {
          // the change in y is what made it it, calculate the position hit based on the x and z
          const HIT_X: number = currentRayPositionX % GameMap.tileSize
          const HIT_Z: number = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize)

          pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_X / GameMap.wallBitSize)]
        } else {
          // the change in y is what made it it, calculate the position hit based on the x and z
          const HIT_X: number = currentRayPositionX % GameMap.tileSize
          const HIT_Y: number = currentRayPositionY % GameMap.tileSize

          pixelColorCode = GameMap.wallTexture[1][Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
        }
        return [
          Math.sqrt(
          Math.pow(currentRayPositionX - this._x, 2) +
          Math.pow(currentRayPositionY - this._y, 2) + 
          Math.pow(currentRayPositionZ - this._z, 2)
          ), 
          pixelColorCode!
        ]
      } else if (rayhitCharacter) { 
        return [
          Math.sqrt(
          Math.pow(currentRayPositionX - this._x, 2) +
          Math.pow(currentRayPositionY - this._y, 2) + 
          Math.pow(currentRayPositionZ - this._z, 2)
          ), 
          hitColor
        ]
      } else if (
        Math.sqrt(
        Math.pow(currentRayPositionX - this._x, 2) +
        Math.pow(currentRayPositionY - this._y, 2) + 
        Math.pow(currentRayPositionZ - this._z, 2)) > Game.instance.maxRenderDistance
      ) {
        return [Math.sqrt(
          Math.pow(currentRayPositionX - this._x, 2) +
          Math.pow(currentRayPositionY - this._y, 2) + 
          Math.pow(currentRayPositionZ - this._z, 2)), Colors.GRAY]
      }

      // move the ray 1 unit in the unit vector's direction
      currentRayPositionX += RAY_VELOCITY_X
      currentRayPositionY += RAY_VELOCITY_Y
      currentRayPositionZ += RAY_VELOCITY_Z
    }
  }
}


export {Player}