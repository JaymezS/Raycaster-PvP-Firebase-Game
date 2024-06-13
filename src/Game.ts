import { PlayerController } from "./PlayerController.js";
import { Canvas } from "./Canvas.js";
import { DisplayMenuAndSetMouseControllerCommand, RemoveClientPlayerFromDatabaseCommand, StartGameCommand } from "./Command.js";
import { Utilities } from "./Utilities.js";
import { Player } from "./Player.js";
import { GameMap } from "./Map.js";
import { CompositeMenu, MenuButton } from "./Menu.js";
import { PIXEL_COLORS } from "./Map.js";
import {
  ref,
  onValue,
  //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
import { VectorMath } from "./Vector.js";


class Game {
  private static _instance: Game | undefined;
  readonly player: Player = new Player()
  readonly gameMap: GameMap = new GameMap()
  readonly controller: PlayerController = new PlayerController(this.player)
  private context = Canvas.instance.context;
  private gameLoop: any = undefined;
  readonly FPS: number = 60;
  private timeInterval: number = 1000/this.FPS
  readonly resolution: number = 10;
  readonly gravitationalAccelerationConstant: number = 1
  readonly terminalVelocity: number = 12
  readonly maxRenderDistance: number = 8 * GameMap.tileSize;
  
  private mainMenu: CompositeMenu = new CompositeMenu("main menu")

  public otherPlayers = {}

  private constructor() {
    this.composeMainMenu()

    window.addEventListener("beforeunload", function (e) {
      Game.instance.endGame()
      new RemoveClientPlayerFromDatabaseCommand().execute()
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
          this.otherPlayers = snapshot.val();

          //Remove the player, but keep all the other users
          delete this.otherPlayers[this.player.id];
        }
      },
      { onlyOnce: true }
    );
  }

  public startGame() {
    this.gameLoop = setInterval(() => {
      this.updateFromDatabase()
      this.controller.updatePlayer()
      this.renderForPlayer()
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



  public renderForPlayer() {
    this.clearScreen()
    const TIME: number = performance.now()

    const ADJACENT_LENGTH_MAGNITUDE: number = (Canvas.WIDTH / 2) / Math.tan(this.player.fov / 2)
    const PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR: number[] =
      VectorMath.convertYawAndPitchToUnitVector([this.player.yaw, this.player.pitch])
    const PLAYER_TO_VIEWPORT_CENTER_VECTOR: number[] =
      VectorMath.convertUnitVectorToVector(PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR, ADJACENT_LENGTH_MAGNITUDE)
    
    // 1 unit vector from the left of the view port to the right
    const PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR: number[] = 
      VectorMath.convertYawAndPitchToUnitVector([this.player.yaw + Math.PI / 2, 0])
    
    // 1 unit vector from the top of the viewport to the bottom
    let PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR: number[]
    
    if (this.player.pitch >= 0) {
      PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
        VectorMath.convertYawAndPitchToUnitVector([this.player.yaw, this.player.pitch - Math.PI / 2]);
    } else {
      PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
        VectorMath.convertYawAndPitchToUnitVector([Math.PI + this.player.yaw, -(Math.PI / 2 + this.player.pitch)]);
    }
    // bruh opposite direction != -1 * yaw, was stuck for 2 hours

    let playerToViewportTopLeftVector: number[] = VectorMath.addVectors(
      PLAYER_TO_VIEWPORT_CENTER_VECTOR,
      VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, -Canvas.WIDTH/2)
    )
    playerToViewportTopLeftVector = VectorMath.addVectors(
      playerToViewportTopLeftVector,
      VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, -Canvas.HEIGHT/2)
    )

    
    for (let x: number = 0; x < Canvas.WIDTH; x += this.resolution) {
      // default ray cast
      // const CURRENT_RAY_YAW = (this.player.yaw - this.player.fov / 2) +
      //   (x / Canvas.WIDTH) * this.player.fov;

      // attempted fix to gradient
      // let rayAngleYaw: number = Utilities.calculateAngleFromLeftOfCone(
      //   this.player.fov, Canvas.WIDTH, x
      // )

      // problem lies in this line, should not add, but use a formula to combine the two
      // ie imagine the player is looking up, the player's viewport is a plane not paralle to any axial planes
      // therefore, when viewed from above, the player's viewport's vertices have different yaws
      // 

      // fix: since player's angle can be expressed as a vector, do that, then for every pixel, express it as a vector from the center of the viewport plane, then perform vector addition, and convert the resultant back to yaw and pitch
      
      // note that conversion must first be done to incoporate Canvas size as a part of the viewport plane.
      
      // with this fix, x and y would not be seperate, each pair of x and y will generate a unique resultant vector, and thereby a unique pitch and yaw
      // rayAngleYaw += (this.player.yaw - this.player.fov / 2)

      for (let y: number = 0; y < Canvas.HEIGHT; y += this.resolution) {
        // old ray pitch
        // const CURRENT_RAY_PITCH = (this.player.pitch + VERTICAL_FOV / 2) -
        //   (y / Canvas.HEIGHT) * VERTICAL_FOV

        // attempted fix to gradient
        // Note that this does nothing right now

        // let rayAnglePitch: number = Utilities.calculateAngleFromLeftOfCone(
        //   VERTICAL_FOV, Canvas.HEIGHT, y
        // )
        // rayAnglePitch = (this.player.pitch + VERTICAL_FOV / 2) - rayAnglePitch
        


        let viewportTopLeftToPointVector: number[] =
          VectorMath.addVectors(
            VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, x),
            VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, y)
          );
        let vectorFromPlayerToPoint: number[] = VectorMath.addVectors(playerToViewportTopLeftVector, viewportTopLeftToPointVector)
        let rayAngles: number[] = VectorMath.convertVectorToYawAndPitch(vectorFromPlayerToPoint)

        // replace with angles[0] and angles[1] later
        const RAW_RAY_DISTANCE = this.player.castBlockVisionRay(rayAngles[0], rayAngles[1]);
        
        // custom shading
        // render the pixel
        const COLOR = PIXEL_COLORS[RAW_RAY_DISTANCE[1]]
        const brightness: number = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 0.7) 

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