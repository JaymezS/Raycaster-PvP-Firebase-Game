class Player {
  // note that x and y are center values
  private _x: number = GameMap.tileSize * 1.5
  private _y: number = GameMap.tileSize * 1.5
  private size: number = 32
  private _angle: number = 0
  private _speed: number = 3
  private _rotationSpeed: number = Math.PI/180
  private _fov = Math.PI / 3; // Field of view
  private xVelocity: number = this.speed * Math.cos(this._angle);
  private yVelocity: number = this.speed * Math.sin(this._angle);
  
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
    this.updateVelocities()
    this.moveX()
    this.moveY()
  }

  public moveBackward(): void {
    this.updateVelocities()
    this.xVelocity *= -1
    this.yVelocity *= -1
    this.moveX()
    this.moveY()
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

  public rotateRight(): void {
    this._angle += this.rotationSpeed
  }

  public rotateLeft(): void {
    this._angle -= this.rotationSpeed;
  }

  public updateVelocities(): void {
    this.xVelocity = this.speed * Math.cos(this._angle);
    this.yVelocity = this.speed * Math.sin(this._angle);
  }

  public collideWithWall(): boolean {
    const GAME_MAP: number[][] = Game.instance.gameMap.map
    for (let i = 0; i < GAME_MAP.length; i++) {
      for (let j = 0; j < GAME_MAP[0].length; j++) {
        if (GAME_MAP[i][j] !== 0) {
          const TILE_LEFT_BOUND: number = j * GameMap.tileSize;
          const TILE_RIGHT_BOUND: number = (j + 1) * GameMap.tileSize
          const TILE_UP_BOUND: number = i * GameMap.tileSize;
          const TILE_DOWN_BOUND: number = (i + 1) * GameMap.tileSize
          if (
            this.x + this.size / 2 > TILE_LEFT_BOUND &&
            this.x - this.size / 2 < TILE_RIGHT_BOUND &&
            this.y - this.size / 2 < TILE_DOWN_BOUND &&
            this.y + this.size / 2 > TILE_UP_BOUND
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public castVisionRay(angle: number): number[] {
    let currentRayPositionX: number = this.x;
    let currentRayPositionY: number = this.y;

    let distanceTravelledX: number = 0;
    let distanceTravelledY: number = 0;

    const RAY_DIRECTION_X: number = Math.cos(angle)
    const RAY_DIRECTION_Y: number = Math.sin(angle)

    while (true) {

      // check ray's collision with map tiles (walls)
      const MAP_X = Math.floor(currentRayPositionX / GameMap.tileSize);
      const MAP_Y = Math.floor(currentRayPositionY / GameMap.tileSize);
      // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
      if (Game.instance.gameMap.map[MAP_Y][MAP_X] === 1) {
        let textureX: number = 0
        const hitX = (currentRayPositionX - MAP_X * GameMap.tileSize) % GameMap.tileSize;
        const hitY = (currentRayPositionY - MAP_Y * GameMap.tileSize) % GameMap.tileSize;

        const BACKTRACK_RAY_X: number = currentRayPositionX - RAY_DIRECTION_X
        const BACKTRACK_MAP_X: number = Math.floor(BACKTRACK_RAY_X / GameMap.tileSize);
        // if by backtracking x, the ray no longer hits, then x is what made it hit, so it's a collision in the x direction
        if (Game.instance.gameMap.map[MAP_Y][BACKTRACK_MAP_X] === 0) {
          textureX = hitY
        } else {
          textureX = hitX
        }

        return [
          Math.sqrt(Math.pow(distanceTravelledX, 2) + Math.pow(distanceTravelledY, 2)),
          textureX
        ];
      }

      // move the ray
      distanceTravelledX += RAY_DIRECTION_X
      distanceTravelledY += RAY_DIRECTION_Y
      currentRayPositionX += RAY_DIRECTION_X
      currentRayPositionY += RAY_DIRECTION_Y
    }
  }
}