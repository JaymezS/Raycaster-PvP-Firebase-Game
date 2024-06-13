import { UpdatePlayerPositionToFirebaseCommand } from "./Command.js"
import { Game } from "./Game.js"
import { GameMap, Colors, PIXEL_COLORS } from "./Map.js"
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Utilities } from "./Utilities.js";
import { VectorMath } from "./Vector.js";

class Player {

  public static size: number = 56
  // note that x and y are center values
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private _z: number = GameMap.tileSize * 2
  private size: number = Player.size
  private _yaw: number = 0;
  private _pitch: number = 0;
  private _rotationSpeed: number = Math.PI/180
  private _fov = Math.PI / 2; // Field of view
  public colorCode: number = Utilities.randInt(0, PIXEL_COLORS.length)
  readonly acceleration: number = 1
  readonly maxMovingSpeed: number = 8

  public isAcceleratingLeft: boolean = false;
  public isAcceleratingRight: boolean = false;
  public isAcceleratingForward: boolean = false;
  public isAcceleratingBackward: boolean = false;

  readonly id: string = nanoid(20);


  private grounded: boolean = false;

  private maxPitch: number = Math.PI / 2

  private velocityVector: number[] = [0, 0, 0]
  
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
      this.velocityVector[2] = 12
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


  public determineIntendedMovementDirectionVectorBasedOnAccelerationDirections(): number[] {
    const forwardV: number[] = VectorMath.convertYawAndPitchToUnitVector([this.yaw, 0])
    const backwardV: number[] = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI, 0])
    const leftV: number[] = VectorMath.convertYawAndPitchToUnitVector([this.yaw - Math.PI / 2, 0])
    const rightV: number[] = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI / 2, 0])
    
    let vectorSum: number[] = [0, 0, 0];
    if (this.isAcceleratingBackward) {
      vectorSum = VectorMath.addVectors(vectorSum, backwardV)
    } 
    if (this.isAcceleratingForward) {
      vectorSum = VectorMath.addVectors(vectorSum, forwardV)
    } 
    if (this.isAcceleratingLeft) {
      vectorSum = VectorMath.addVectors(vectorSum, leftV)
    } 
    if (this.isAcceleratingRight) {
      vectorSum = VectorMath.addVectors(vectorSum, rightV)
    } 
    return VectorMath.convertVectorToUnitVector(vectorSum);
  }


  public modifyVelocityVectorBasedOnIntendedVector() {
    const INTENDED_MOVEMENT_DIRECTION: number[] =
      this.determineIntendedMovementDirectionVectorBasedOnAccelerationDirections();
    
    if (INTENDED_MOVEMENT_DIRECTION[0] !== 0 || INTENDED_MOVEMENT_DIRECTION[1] !== 0) {
      const INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE: number[] = 
      VectorMath.convertUnitVectorToVector(INTENDED_MOVEMENT_DIRECTION, this.acceleration)
      this.velocityVector[0] += INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE[0]
      this.velocityVector[1] += INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE[1]

      // limit horizontal movement speed
      const HV_VECTOR: number[] = [this.velocityVector[0], this.velocityVector[1], 0]
      if (VectorMath.getMagnitude(HV_VECTOR) > this.maxMovingSpeed) {
        const CORRECTED_VECTOR: number[] =
          VectorMath.convertUnitVectorToVector(
            VectorMath.convertVectorToUnitVector(HV_VECTOR), this.maxMovingSpeed
          )
        this.velocityVector[0] = CORRECTED_VECTOR[0]
        this.velocityVector[1] = CORRECTED_VECTOR[1]
      }
    } else if (INTENDED_MOVEMENT_DIRECTION[0] === 0 && INTENDED_MOVEMENT_DIRECTION[1] === 0) {
      // check for deceleration
      // decelerate character
      const DECELERATE_DIRECTION: number[] =
        VectorMath.scalarMultiply(this.velocityVector, -1)
      const INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE: number[] = 
        VectorMath.convertUnitVectorToVector(DECELERATE_DIRECTION, this.acceleration)
        this.velocityVector[0] += INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE[0]
        this.velocityVector[1] += INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE[1]
    }
    

  }


  public moveX(): void {
    this._x += this.velocityVector[0]
    if (this.collideWithWall()) {
      this._x -= this.velocityVector[0]
    }
  }

  public moveY(): void {
    this._y += this.velocityVector[1]
    if (this.collideWithWall()) {
      this._y -= this.velocityVector[1]
    }
  }

  public moveZ(): void {
    this._z += this.velocityVector[2]
    if (this.collideWithWall()) {
      if (this.velocityVector[2] < 0) {
        this.grounded = true
      } else {
        this._z -= this.velocityVector[2];
        this.velocityVector[2] = 0
        return
      }
      this._z -= this.velocityVector[2];
    } else {
      this.grounded = false
    }
    new UpdatePlayerPositionToFirebaseCommand(this).execute()
  }

  public updatePosition(): void {
    this.modifyVelocityVectorBasedOnIntendedVector()
    this.moveX()
    this.moveY()
    this.updateVerticalMovementDueToGravity()
    new UpdatePlayerPositionToFirebaseCommand(this).execute()
  }


  public updateVerticalMovementDueToGravity(): void {
    if (!this.grounded) {
      if (this.velocityVector[2] <= -Game.instance.terminalVelocity) {
        this.velocityVector[2] = -Game.instance.terminalVelocity
      } else {
        this.velocityVector[2] -= Game.instance.gravitationalAccelerationConstant;
      }
    } else if (this.velocityVector[2] < 0) {
      this.velocityVector[2] = 0
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