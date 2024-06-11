class Game {
  private static _instance: Game | undefined;
  private player: Player = new Player()
  readonly gameMap: GameMap = new GameMap()
  private controller: PlayerController = new PlayerController(this.player)
  private context = Canvas.instance.context;
  private gameLoop: any = undefined;
  readonly FPS: number = 60;
  private timeInterval: number = 1000/this.FPS

  private constructor() {
    this.gameLoop = setInterval(() => {
      this.controller.updatePlayer()
      this.renderForPlayer(this.player)
    }, this.timeInterval);
  }

  private clearScreen(): void {
    this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
  }

  public renderForPlayer(player: Player) {
    this.clearScreen()
    for (let rayColumn = 0; rayColumn < Canvas.WIDTH; rayColumn++) {
      const CURRENT_RAY_ANGLE = (player.angle - player.fov / 2) + (rayColumn / Canvas.WIDTH) * player.fov;
      const RAW_RAY_DISTANCE = player.castVisionRay(CURRENT_RAY_ANGLE);

      // cos angle = distance to wall (adj) / raw ray distance (hyp) 
      // distance to wall = raw distance * cos angle
      // angle = ray angle - player angle (or vice versa doesn't matter)
      const CORRECTED_DISTANCE = RAW_RAY_DISTANCE * Math.cos(player.angle - CURRENT_RAY_ANGLE);
      const WALL_LINE_HEIGHT = GameMap.tileSize / CORRECTED_DISTANCE * Canvas.HEIGHT;

      const LINE_START_POSITION = Canvas.HEIGHT/2 - WALL_LINE_HEIGHT/2;
      const LINE_END_POSITION = Canvas.HEIGHT/2 + WALL_LINE_HEIGHT/2;


      /*
      GPT shit code for ceiling, tried to fix
      const RENDERING_QUALITY: number = 10
      const LINE_SEGMENT_LENGTH: number = Math.ceil(LINE_START_POSITION / RENDERING_QUALITY);
      for (let y = 0; y < LINE_START_POSITION; y+= LINE_SEGMENT_LENGTH) {
        const ceilingDistance = Canvas.HEIGHT / (Canvas.HEIGHT - 2 * y);
        const brightness = Math.max(0, 1 - ceilingDistance / 10);
        Utilities.drawLine(rayColumn, y, rayColumn, y+ LINE_SEGMENT_LENGTH,
          `rgb(
          ${Math.floor(this.gameMap.ceilingColor[0] * brightness)},
          ${Math.floor(this.gameMap.ceilingColor[1] * brightness)},
          ${Math.floor(this.gameMap.ceilingColor[2] * brightness)}
          )`
        );
      }
      */


      const brightness: number = Math.min(GameMap.tileSize / (RAW_RAY_DISTANCE), 1) 
      // custom shading, either use raw distance or distance to wall, either is fine, raw is more realistic
      // render the wall
      Utilities.drawLine(rayColumn, LINE_START_POSITION, rayColumn, LINE_END_POSITION,
        `rgb(
        ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[2] * brightness)}
        )`
      );


    }
  }
  
  public static get instance(): Game {
    if (Game._instance === undefined) {
      Game._instance = new Game()
    }
    return Game._instance;
  }
}