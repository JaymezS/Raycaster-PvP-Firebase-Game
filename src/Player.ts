import { UpdatePlayerPositionToFirebaseCommand } from "./Command.js"
import { Game } from "./Game.js"
import { GameMap, Colors, PIXEL_COLORS } from "./Map.js"
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Utilities } from "./Utilities.js";
import { VectorMath, Vector, Position, Direction } from "./Vector.js";
import { Bullet } from "./Bullet.js";

class Player {

  public static size: number = 56
  // note that x and y are center values
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private _z: number = GameMap.tileSize * 1.9
  private size: number = Player.size
  private _yaw: number = 0;
  private _pitch: number = 0;
  private _rotationSpeed: number = Math.PI/180
  private _fov = Math.PI / 2; // Field of view
  public colorCode: number = Utilities.randInt(0, PIXEL_COLORS.length)
  readonly acceleration: number = 2
  readonly maxMovingSpeed: number = 8

  readonly id: string = nanoid(20);


  private grounded: boolean = false;

  private maxPitch: number = Math.PI / 2

  private velocityVector: Vector = [0, 0, 0]
  private _directionVector: Vector = [1, 0, 0]
  
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
  public get directionVector(): Vector {
    return this._directionVector
  }

  public jump(): void {
    if (this.grounded) {
      this.velocityVector[2] = 12
    }
  }


  public setLocation(location: Position) {
    this._x = location[0];
    this._y = location[1];
    this._z = location[2];
  }


  public setDirection(direction: Direction) {
    this._pitch = direction[1]
    this._yaw = direction[0]
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


  public determineIntendedMovementDirectionVectorBasedOnAccelerationDirections(): Vector {
    const forwardV: Vector = VectorMath.convertYawAndPitchToUnitVector([this.yaw, 0])
    const backwardV: Vector = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI, 0])
    const leftV: Vector = VectorMath.convertYawAndPitchToUnitVector([this.yaw - Math.PI / 2, 0])
    const rightV: Vector = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI / 2, 0])
    
    let vectorSum: Vector = [0, 0, 0];
    if (!Game.instance.isPaused) {
      if (Game.instance.controller.sKeyPressed) {
        vectorSum = VectorMath.addVectors(vectorSum, backwardV)
      } 
      if (Game.instance.controller.wKeyPressed) {
        vectorSum = VectorMath.addVectors(vectorSum, forwardV)
      } 
      if (Game.instance.controller.aKeyPressed) {
        vectorSum = VectorMath.addVectors(vectorSum, leftV)
      } 
      if (Game.instance.controller.dKeyPressed) {
        vectorSum = VectorMath.addVectors(vectorSum, rightV)
      } 
    }
    return VectorMath.convertVectorToUnitVector(vectorSum);
  }


  public modifyVelocityVectorBasedOnIntendedVector() {
    const INTENDED_MOVEMENT_DIRECTION: Vector =
      this.determineIntendedMovementDirectionVectorBasedOnAccelerationDirections();
    
    if (INTENDED_MOVEMENT_DIRECTION[0] !== 0 || INTENDED_MOVEMENT_DIRECTION[1] !== 0) {
      const INTENDED_ACCELERATION_VECTOR: Vector = 
        VectorMath.convertUnitVectorToVector(INTENDED_MOVEMENT_DIRECTION, this.acceleration)
      
      this.velocityVector[0] += INTENDED_ACCELERATION_VECTOR[0]
      this.velocityVector[1] += INTENDED_ACCELERATION_VECTOR[1]

      // limit horizontal movement speed
      const HORIZONTAL_VECTOR: Vector = [this.velocityVector[0], this.velocityVector[1], 0]
      if (VectorMath.getMagnitude(HORIZONTAL_VECTOR) > this.maxMovingSpeed) {
        const CORRECTED_VECTOR: Vector =
          VectorMath.convertUnitVectorToVector(
            VectorMath.convertVectorToUnitVector(HORIZONTAL_VECTOR), this.maxMovingSpeed
          )
        this.velocityVector[0] = CORRECTED_VECTOR[0]
        this.velocityVector[1] = CORRECTED_VECTOR[1]
      }
    } else if (INTENDED_MOVEMENT_DIRECTION[0] === 0 && INTENDED_MOVEMENT_DIRECTION[1] === 0) {
      // check for deceleration
      // decelerate character
      const DECELERATE_DIRECTION: Vector =
        VectorMath.convertVectorToUnitVector(VectorMath.scalarMultiply(this.velocityVector, -1))
      const INTENDED_DECELERATION_VECTOR: Vector = 
        VectorMath.convertUnitVectorToVector(DECELERATE_DIRECTION, this.acceleration)
      if (
        VectorMath.getMagnitude(INTENDED_DECELERATION_VECTOR) >
        VectorMath.getMagnitude(this.velocityVector)
      ) {
        this.velocityVector[0] = 0;
        this.velocityVector[1] = 0;
      } else {
        this.velocityVector[0] += INTENDED_DECELERATION_VECTOR[0]
        this.velocityVector[1] += INTENDED_DECELERATION_VECTOR[1]
      }
    }
  }

  public moveX(): void {
    this._x += this.velocityVector[0]
    if (this.collideWithWall()) {
      this._x -= this.velocityVector[0]

      let distanceToWall: number = 0
      if (this.velocityVector[0] > 0) {
        distanceToWall = GameMap.tileSize - (this._x % GameMap.tileSize) - Player.size/2 - 1
      } else if (this.velocityVector[0] < 0) {
        distanceToWall = -(this._x % GameMap.tileSize - Player.size / 2) 
      }
      this._x += distanceToWall
    }
  }

  public moveY(): void {
    this._y += this.velocityVector[1]
    if (this.collideWithWall()) {
      this._y -= this.velocityVector[1]

      let distanceToWall: number = 0
      if (this.velocityVector[1] > 0) {
        distanceToWall = GameMap.tileSize - (this._y % GameMap.tileSize) - Player.size / 2 - 1
      } else if (this.velocityVector[1] < 0) {
        distanceToWall = -(this._y % GameMap.tileSize - Player.size/2)
      }
      this._y += distanceToWall
    }
  }

  public moveZ(): void {
    this._z += this.velocityVector[2]
    if (this.collideWithWall()) {
      this._z -= this.velocityVector[2];
      if (this.velocityVector[2] < 0) {
        this.grounded = true
        this._z -= ((this._z - Player.size) % GameMap.tileSize)
      } else {
        this._z -= this.velocityVector[2];
        this.velocityVector[2] = 0
        this._z += (GameMap.tileSize - (this._z % GameMap.tileSize)) - 1
        this.grounded = false
        return
      }
    } else {
      this.grounded = false
    }
  }

  public updatePosition(): void {
    this._directionVector = VectorMath.convertYawAndPitchToUnitVector([this._yaw, this._pitch])
    this.modifyVelocityVectorBasedOnIntendedVector()
    this.moveX()
    this.moveY()
    if (Game.instance.controller.spaceKeyPressed && !Game.instance.isPaused) {
      this.jump()
    }
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



  public castBlockVisionRayVersion2(yaw: number, pitch: number): number[] {
    const MAP_LENGTH_Z: number = Game.instance.gameMap.map.length * GameMap.tileSize
    const MAP_LENGTH_Y: number = Game.instance.gameMap.map[0].length * GameMap.tileSize;
    const MAP_LENGTH_X: number = Game.instance.gameMap.map[0][0].length * GameMap.tileSize

    const RAY_VELOCITY: Vector = VectorMath.convertYawAndPitchToUnitVector([yaw, pitch])
    const PLAYER_POSITION: Position = [this._x, this._y, this._z]

    // calculate the closest x, y, z axis collision, skip empty space, take shortest distance
    let XCollisionResults: number[] = [10000, 0];
    let YCollisionResults: number[] = [10000, 0];
    let ZCollisionResults: number[] = [10000, 0];

    let checkXZPlaneCollision: boolean = !(RAY_VELOCITY[1] === 0);
    let checkXYPlaneCollision: boolean = !(RAY_VELOCITY[2] === 0);
    let checkYZPlaneCollision: boolean = !(RAY_VELOCITY[0] === 0);


    // CHECK PLANE XY COLLISION
    if (checkXYPlaneCollision) {
      const NORMAL_VECTOR: Vector = [0, 0, 1];
      let distanceToClosestXYPlane: number
      let planeZLevelMultiplier: number = 1
      if (RAY_VELOCITY[2] > 0) {
        distanceToClosestXYPlane = Math.ceil(GameMap.tileSize - (this._z % GameMap.tileSize)) + 0.1
        planeZLevelMultiplier = 1;
      } else {
        distanceToClosestXYPlane = -Math.ceil(this._z % GameMap.tileSize) - 0.1
        planeZLevelMultiplier = -1
      }

      let planeZLevel: number = this._z + distanceToClosestXYPlane
      while (true) {
        const POI: Position = VectorMath.linePlaneIntersection(
          NORMAL_VECTOR,
          [0, 0, planeZLevel], 
          PLAYER_POSITION, 
          RAY_VELOCITY
        )
        if (
          POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
          POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
          POI[2] >= 0 && POI[2] < MAP_LENGTH_Z
        ) {
          if (
            Game.instance.gameMap.map
            [Math.floor(POI[2] / GameMap.tileSize)]
            [Math.floor(POI[1] / GameMap.tileSize)]
            [Math.floor(POI[0] / GameMap.tileSize)] === 1
          ) {
            // ray hit
            const DISTANCE: number = VectorMath.getDistance(POI, PLAYER_POSITION)
            const HIT_X: number = Math.abs(POI[0] % GameMap.tileSize)
            const HIT_Y: number = Math.abs(POI[1] % GameMap.tileSize)
            
            // NOTE: (*0.99) and (+- 0.1) in the above is a bandaid solution to prevent overflowing texture bound
            // Since POI Calculations are precise, sometimes it gets HIT_X = 64 (boundary)
            // So the wall Texture array access will exceed length

            const PIXEL_COLOR: number = GameMap.wallTexture[1][Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
            ZCollisionResults = [DISTANCE, PIXEL_COLOR]
            break
          }
        } else {
          break;
        }
        planeZLevel += GameMap.tileSize * planeZLevelMultiplier
      }
    }



    // CHECK RAY YZ COLLISION
    if (checkYZPlaneCollision) {
      const NORMAL_VECTOR: Vector = [1, 0, 0];

      let distanceToClosestYZPlane: number
      let planeXLevelMultiplier: number = 1
      if (RAY_VELOCITY[0] > 0) {
        distanceToClosestYZPlane = Math.ceil(GameMap.tileSize - (this._x % GameMap.tileSize)) + 0.1
        planeXLevelMultiplier = 1;
      } else {
        distanceToClosestYZPlane = -Math.ceil(this._x % GameMap.tileSize) - 0.1
        planeXLevelMultiplier = -1
      }

      let planeXLevel: number = this._x + distanceToClosestYZPlane
      while (true) {
        const POI: Position = VectorMath.linePlaneIntersection(
          NORMAL_VECTOR,
          [planeXLevel, 0, 0], 
          PLAYER_POSITION, 
          RAY_VELOCITY
        )
        if (
          POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
          POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
          POI[2] >= 0 && POI[2] < MAP_LENGTH_Z
        ) {
          if (
            Game.instance.gameMap.map
            [Math.floor(POI[2] / GameMap.tileSize)]
            [Math.floor(POI[1] / GameMap.tileSize)]
            [Math.floor(POI[0] / GameMap.tileSize)] === 1
          ) {
            // ray hit
            const DISTANCE: number = VectorMath.getDistance(POI, PLAYER_POSITION)
            const HIT_Y: number = Math.abs(POI[1] % GameMap.tileSize)
            const HIT_Z: number = Math.abs(GameMap.tileSize - (POI[2] % GameMap.tileSize)) * 0.99
            const PIXEL_COLOR: number = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
            XCollisionResults = [DISTANCE, PIXEL_COLOR]
            break
          }
        } else {
          break;
        }
        planeXLevel += GameMap.tileSize * planeXLevelMultiplier
      }
    }




    // CHECK PLANE XZ COLLISION
    if (checkXZPlaneCollision) {
      const NORMAL_VECTOR: Vector = [0, 1, 0];

      let distanceToClosestXZPlane: number
      let planeYLevelMultiplier: number = 1
      if (RAY_VELOCITY[1] > 0) {
        distanceToClosestXZPlane = Math.ceil(GameMap.tileSize - (this._y % GameMap.tileSize)) + 0.1
        planeYLevelMultiplier = 1;
      } else {
        distanceToClosestXZPlane = -Math.ceil(this._y % GameMap.tileSize) - 0.1
        planeYLevelMultiplier = -1
      }
      let planeYLevel: number = this._y + distanceToClosestXZPlane
      while (true) {
        const POI: Position = VectorMath.linePlaneIntersection(
          NORMAL_VECTOR,
          [0, planeYLevel, 0], 
          PLAYER_POSITION, 
          RAY_VELOCITY
        )
        if (
          POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
          POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
          POI[2] >= 0 && POI[2] < MAP_LENGTH_Z
        ) {
          if (
            Game.instance.gameMap.map
            [Math.floor(POI[2] / GameMap.tileSize)]
            [Math.floor(POI[1] / GameMap.tileSize)]
            [Math.floor(POI[0] / GameMap.tileSize)] === 1
          ) {
            // ray hit
            const DISTANCE: number = VectorMath.getDistance(POI, PLAYER_POSITION)
            const HIT_X: number = Math.abs(POI[0] % GameMap.tileSize)
            const HIT_Z: number = Math.abs(GameMap.tileSize - (POI[2] % GameMap.tileSize)) * 0.99

            const PIXEL_COLOR: number = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_X / GameMap.wallBitSize)]
            YCollisionResults = [DISTANCE, PIXEL_COLOR]
            break
          }
        } else {
          break;
        }
        planeYLevel += GameMap.tileSize * planeYLevelMultiplier
      }
    }

    
    let results: number[];

    if (
      YCollisionResults[0] <= XCollisionResults[0] &&
      YCollisionResults[0] <= ZCollisionResults[0]
    ) {
      results = YCollisionResults
    } else if (
      XCollisionResults[0] <= YCollisionResults[0] &&
      XCollisionResults[0] <= ZCollisionResults[0]
    ) {
      results = XCollisionResults
    } else {
      results = ZCollisionResults
    }

    const COLLISION_WITH_PLAYER: number[] = this.getShortestRayCollisionToPlayer(RAY_VELOCITY);
    if (COLLISION_WITH_PLAYER[0] < results[0]) {
      results = COLLISION_WITH_PLAYER
    }

    const COLLISION_WITH_BULLET: number[] = this.getShortestRayCollisionToBullet(RAY_VELOCITY);
    if (COLLISION_WITH_BULLET[0] < results[0]) {
      results = COLLISION_WITH_BULLET
    }

    return results;
  }


  public getShortestRayCollisionToBullet(rayVector: Vector): number[] {
    let shortestDistance: number = 1000000;

    const BULLET_POSITIONS: { x: number, y: number, z: number, id: string, sourcePlayerID: string }[] = Object.values(Game.instance.allBullets)
    
    
    for (let bullet of BULLET_POSITIONS) { 
      const bulletMin: Position = [bullet.x - Bullet.size / 2, bullet.y - Bullet.size / 2, bullet.z - Bullet.size / 2 ]
      const bulletMax: Position = [bullet.x + Bullet.size / 2, bullet.y + Bullet.size / 2, bullet.z + Bullet.size / 2]
      const INTERSECTIONS: Position[] | null = VectorMath.findLineCubeIntersections(
        [this._x, this._y, this._z], 
        rayVector, 
        bulletMin, 
        bulletMax
      )

      if (INTERSECTIONS) {
        for (let point of INTERSECTIONS) { 
          if (
            VectorMath.isSameDirection(
              VectorMath.drawVectorFromP1toP2([this._x, this._y, this._z], point), 
              rayVector
            )
          ) {
            const DISTANCE: number = VectorMath.getDistance([this._x, this._y, this._z], point)
            if (DISTANCE < shortestDistance) {
              shortestDistance = DISTANCE
            }
          }
        }
      }
    }
    return [shortestDistance, Bullet.color]
  }

  public getShortestRayCollisionToPlayer(rayVector: Vector): number[] {
    let shortestDistance: number = 1000000;
    let color: number = 0

    const CHARACTERS_POSITIONS: { x: number, y: number, z: number, color: number }[] = Object.values(Game.instance.otherPlayers)
    
    for (let char of CHARACTERS_POSITIONS) { 
      const charMin: Position = [char.x - Player.size / 2, char.y - Player.size / 2, char.z - Player.size]
      const charMax: Position = [char.x + Player.size / 2, char.y + Player.size / 2, char.z]
      const INTERSECTIONS: Position[] | null = VectorMath.findLineCubeIntersections(
        [this._x, this._y, this._z], 
        rayVector, 
        charMin, 
        charMax
      )

      if (INTERSECTIONS) {
        for (let point of INTERSECTIONS) { 
          if (
            VectorMath.isSameDirection(
              VectorMath.drawVectorFromP1toP2([this._x, this._y, this._z], point), 
              rayVector
            )
          ) {
            const DISTANCE: number = VectorMath.getDistance([this._x, this._y, this._z], point)
            if (DISTANCE < shortestDistance) {
              shortestDistance = DISTANCE
              color = char.color
            }
          }
        }
      }
    }
    return [shortestDistance, color]
  }


  // public castBlockVisionRay(yaw: number, pitch: number): number[] {

  //   // cheap way to increase performance by increasing the ray cast speed, it does reduce accuracy of render tho
  //   // 4-5 is the limit, any higher and graphics will be completely innaccurate
  //   // remove this method later, try  to use castBlockVisionRay2 if possible
  //   // higher # = more innaccurate graphics
  //   const RAY_SPEED: number = 5;

  //   let currentRayPositionX: number = this._x;
  //   let currentRayPositionY: number = this._y;
  //   let currentRayPositionZ: number = this._z;

  //   const RAY_VELOCITY_X: number = RAY_SPEED * Math.cos(pitch) * Math.cos(yaw)
  //   const RAY_VELOCITY_Y: number = RAY_SPEED * Math.cos(pitch) * Math.sin(yaw)
  //   const RAY_VELOCITY_Z: number = RAY_SPEED * Math.sin(pitch)

  //   const CHARACTERS_POSITIONS: {x: number, y: number, z: number, color: number}[] = Object.values(Game.instance.otherPlayers)

  //   while (true) {

  //     let rayhitCharacter: boolean = false;
  //     let hitColor: number = undefined;
  //     for (let char of CHARACTERS_POSITIONS) {
  //       if (
  //         this.pointInCharacterAtLocation(
  //           currentRayPositionX,
  //           currentRayPositionY,
  //           currentRayPositionZ,
  //           char.x,
  //           char.y,
  //           char.z
  //         )
  //       ) {
  //         rayhitCharacter = true;
  //         hitColor = char.color
  //       }
  //     }
 
  //     // if the ray collided into a wall, return the distance the 
  //     // ray has travelled and the x position of the wall hit(from the left)
  //     if (
  //       Game.instance.gameMap.map
  //       [Math.floor(currentRayPositionZ / GameMap.tileSize)]
  //       [Math.floor(currentRayPositionY / GameMap.tileSize)]
  //       [Math.floor(currentRayPositionX / GameMap.tileSize)] === 1
  //     ) {
  //       let pixelColorCode: number;
  //       const RETRACED_X = currentRayPositionX - RAY_VELOCITY_X
  //       const RETRACED_Y = currentRayPositionY - RAY_VELOCITY_Y
  //       if (
  //         Game.instance.gameMap.map
  //         [Math.floor(currentRayPositionZ / GameMap.tileSize)]
  //         [Math.floor(currentRayPositionY / GameMap.tileSize)]
  //         [Math.floor(RETRACED_X / GameMap.tileSize)] === 0
  //       ) {
  //         // the change in x is what made it it, calculate the position hit based on the y and z
  //         const HIT_Y: number = currentRayPositionY % GameMap.tileSize
  //         const HIT_Z: number = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize)

  //         pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
  //       } else if (
  //         Game.instance.gameMap.map
  //         [Math.floor(currentRayPositionZ / GameMap.tileSize)]
  //         [Math.floor(RETRACED_Y / GameMap.tileSize)]
  //         [Math.floor(currentRayPositionX / GameMap.tileSize)] === 0
  //       ) {
  //         // the change in y is what made it it, calculate the position hit based on the x and z
  //         const HIT_X: number = currentRayPositionX % GameMap.tileSize
  //         const HIT_Z: number = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize)

  //         pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_X / GameMap.wallBitSize)]
  //       } else {
  //         // the change in z is what made it it, calculate the position hit based on the x and y
  //         const HIT_X: number = currentRayPositionX % GameMap.tileSize
  //         const HIT_Y: number = currentRayPositionY % GameMap.tileSize

  //         pixelColorCode = GameMap.wallTexture[1][Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)]
  //       }
  //       return [
  //         Math.sqrt(
  //         Math.pow(currentRayPositionX - this._x, 2) +
  //         Math.pow(currentRayPositionY - this._y, 2) + 
  //         Math.pow(currentRayPositionZ - this._z, 2)
  //         ), 
  //         pixelColorCode!
  //       ]
  //     } else if (rayhitCharacter) { 
  //       return [
  //         Math.sqrt(
  //         Math.pow(currentRayPositionX - this._x, 2) +
  //         Math.pow(currentRayPositionY - this._y, 2) + 
  //         Math.pow(currentRayPositionZ - this._z, 2)
  //         ), 
  //         hitColor
  //       ]
  //     } else if (
  //       Math.sqrt(
  //       Math.pow(currentRayPositionX - this._x, 2) +
  //       Math.pow(currentRayPositionY - this._y, 2) + 
  //       Math.pow(currentRayPositionZ - this._z, 2)) > Game.instance.maxRenderDistance
  //     ) {
  //       return [Math.sqrt(
  //         Math.pow(currentRayPositionX - this._x, 2) +
  //         Math.pow(currentRayPositionY - this._y, 2) + 
  //         Math.pow(currentRayPositionZ - this._z, 2)), Colors.GRAY]
  //     }

  //     // move the ray 1 unit in the unit vector's direction
  //     currentRayPositionX += RAY_VELOCITY_X
  //     currentRayPositionY += RAY_VELOCITY_Y
  //     currentRayPositionZ += RAY_VELOCITY_Z
  //   }
  // }
}


export {Player}