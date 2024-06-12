import { PlayerController } from "./PlayerController.js";
import { Canvas } from "./Canvas.js";
import { ClearAllPlayersFromDatabaseCommand, DisplayMenuAndSetMouseControllerCommand, StartGameCommand } from "./Command.js";
import { Utilities } from "./Utilities.js";
import { Player } from "./Player.js";
import { GameMap } from "./Map.js";
import { CompositeMenu, MenuButton } from "./Menu.js";
import { PIXEL_COLORS } from "./Map.js";
import {
  set,
  ref,
  onValue,
  //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";


class Game {
  private static _instance: Game | undefined;
  readonly player: Player = new Player()
  readonly gameMap: GameMap = new GameMap()
  readonly controller: PlayerController = new PlayerController(this.player)
  private context = Canvas.instance.context;
  private gameLoop: any = undefined;
  readonly FPS: number = 60;
  private timeInterval: number = 1000/this.FPS
  readonly resolution: number = 8;
  readonly gravitationalAccelerationConstant: number = 1
  readonly terminalVelocity: number = 20
  readonly maxRenderDistance: number = 8 * GameMap.tileSize;
  
  private mainMenu: CompositeMenu = new CompositeMenu("main menu")

  public players = {}

  private constructor() {
    this.composeMainMenu()

    window.addEventListener("beforeunload", function (e) {
      Game.instance.endGame()
        set(ref(FirebaseClient.instance.db, "/players"), Game.instance.players)
      });
  }

  public start() {
    new DisplayMenuAndSetMouseControllerCommand(this.mainMenu).execute()
  }

  public updateFromDatabase(): void {
    onValue(
      ref(FirebaseClient.instance.db, "/players"),
      (snapshot) => {
        if (snapshot.val()) {
          this.players = snapshot.val();

          //Remove the player, but keep all the other users
          delete this.players[this.player.id];
        }
      },
      { onlyOnce: true }
    );
  }

  public startGame() {
    this.gameLoop = setInterval(() => {
      this.updateFromDatabase()
      this.player.updateVerticalMovementDueToGravity()
      this.controller.updatePlayer()
      this.renderForPlayer(this.player)
    }, this.timeInterval);
  }

  public composeMainMenu(): void {
    const START_BUTTON: MenuButton = new MenuButton(
      Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2,
      Canvas.HEIGHT / 2 - MenuButton.buttonHeight / 2,
      "start game"
    )
    START_BUTTON.addCommand(new StartGameCommand())
    this.mainMenu.addMenuButton(START_BUTTON)
  }

  public endGame() {
    clearInterval(this.gameLoop)
  }

  private clearScreen(): void {
    this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
  }



  public renderForPlayer(player: Player) {
    this.clearScreen()
    const TIME: number = performance.now()
    
    for (let x: number = 0; x < Canvas.WIDTH; x += this.resolution) {
      for (let y: number = 0; y < Canvas.HEIGHT; y += this.resolution) {

        const CURRENT_RAY_YAW = (player.yaw - player.fov / 2) + (x / Canvas.WIDTH) * player.fov;
        const CURRENT_RAY_PITCH = (player.pitch + player.fov / 4) - (y / Canvas.HEIGHT) * player.fov/2

        const RAW_RAY_DISTANCE = player.castBlockVisionRay(CURRENT_RAY_YAW, CURRENT_RAY_PITCH);

        // cos angle = distance to wall (adj) / raw ray distance (hyp)
        // distance to wall = raw distance * cos angle
        // angle = ray angle - player angle (or vice versa doesn't matter)
        
        // old calculations and corrections for 2d raycast
        // const CORRECTED_DISTANCE = RAW_RAY_RESULTS[0] * Math.cos(player.angle - CURRENT_RAY_ANGLE);
        // const WALL_LINE_HEIGHT = GameMap.tileSize / CORRECTED_DISTANCE * Canvas.HEIGHT;
        // const LINE_START_POSITION = Canvas.HEIGHT/2 - WALL_LINE_HEIGHT/2;
        // const LINE_END_POSITION = Canvas.HEIGHT/2 + WALL_LINE_HEIGHT/2;


        // custom shading
        // render the pixel
        const COLOR = PIXEL_COLORS[RAW_RAY_DISTANCE[1]]
        const brightness: number = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 0.5) 
        Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(COLOR[0] * brightness)},
          ${Math.floor(COLOR[1] * brightness)},
          ${Math.floor(COLOR[2] * brightness)}
          )`)
      }
    }
    
    const TIME_TWO: number = performance.now()
    const TIME_DIFF: number = TIME_TWO - TIME;
    this.context.font = "24px Arial"
    this.context.fillStyle = "white"
    this.context.fillText(`MAX FPS: ${Math.round(1000 / TIME_DIFF)}`, 50, 50)
  }
  
  public static get instance(): Game {
    if (Game._instance === undefined) {
      Game._instance = new Game()
    }
    return Game._instance;
  }
}


export {Game}