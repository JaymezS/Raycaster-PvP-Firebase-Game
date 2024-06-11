class Game {
  private static _instance: Game | undefined;
  private player: Player = new Player()
  private gameMap: GameMap = new GameMap()
  private controller: PlayerController = new PlayerController(this.player)
  private context = Canvas.instance.context;
  private gameLoop: any = undefined;
  readonly FPS: number = 60;
  private timeInterval: number = 1000/this.FPS

  private constructor() {
    this.gameLoop = setInterval(() => {
      this.controller.updatePlayer()
      this.render()
    }, this.timeInterval);
  }

  private clearScreen(): void {
    this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
  }

  public render() {
    this.clearScreen()
    for (let x = 0; x < Canvas.WIDTH; x++) {
      const rayAngle = (this.player.angle - this.player.fov / 2) + (x / Canvas.WIDTH) * this.player.fov;
      const ray = this.castRay(rayAngle);

      const distance = ray.distance * Math.cos(rayAngle - this.player.angle);
      const lineHeight = (GameMap.tileSize * Canvas.HEIGHT) / distance;

      const drawStart = -lineHeight / 2 + Canvas.HEIGHT / 2;
      const drawEnd = lineHeight / 2 + Canvas.HEIGHT / 2;

      
      // custom shading
      const brightness: number = Math.min(GameMap.tileSize / distance, 1) 
      this.drawLine(x, drawStart, x, drawEnd,
        `rgb(
        ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[2] * brightness)}
        )`
      );

      /**
       *         `rgb(
        ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[2] * brightness)},
        )`
       */
    }
  }

  public castRay(angle: number) {
    const rayPos = { x: this.player.x, y: this.player.y };
    const rayDir = { x: Math.cos(angle), y: Math.sin(angle) };

    while (true) {
        const mapX = Math.floor(rayPos.x / GameMap.tileSize);
        const mapY = Math.floor(rayPos.y / GameMap.tileSize);

        if (this.gameMap.map[mapY][mapX] === 1) {
            return { x: rayPos.x, y: rayPos.y, distance: Math.hypot(rayPos.x - this.player.x, rayPos.y - this.player.y) };
        }

        rayPos.x += rayDir.x;
        rayPos.y += rayDir.y;
    }
  }

  


  public drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }
  
  public static get instance(): Game {
    if (Game._instance === undefined) {
      Game._instance = new Game()
    }
    return Game._instance;
  }
}