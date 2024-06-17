import { CompositeMenu } from "./Menu.js";
import { Game } from "./Game.js";
import { Player } from "./Player.js";
import {
  update,
  ref,
  set
  //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
import { Canvas } from "./Canvas.js";
import { VectorMath, Vector, Position, Direction } from "./Vector.js";
import { GameMap } from "./Map.js";
import { PIXEL_COLORS } from "./Map.js";
import { Utilities } from "./Utilities.js";
import { Bullet } from "./Bullet.js";

interface Command {
  execute(): void;
}

abstract class HandleMouseClickCommand implements Command {
  
  protected mousePositionX: number = 0
  protected mousePositionY: number = 0

  // either do this or get the coordinates directly from controller in the execute
  // (if having an extra method in commands are not allowed)
  public assignCoordinates(x: number, y: number): Command {
    this.mousePositionX = x;
    this.mousePositionY = y;
    return this
  }

  abstract execute(): void;
}


class MainGameMouseClickedEventHandlerCommand extends HandleMouseClickCommand{
  public execute(): void {
    new ShootBulletCommand(Game.instance.player).execute()
  }
}


class MenuMouseClickedEventHandlerCommand extends HandleMouseClickCommand {
  constructor(private menu: CompositeMenu) {
    super();
  }

  public execute(): void {
    for (let button of this.menu.buttons) {
      if (button.checkCoordinatesOnButton(this.mousePositionX, this.mousePositionY)) {
        button.executeCommand();
        break;
      }
    }
  }
}


class StartGameCommand implements Command {
  public execute(): void {
    Canvas.instance.screen.requestPointerLock();
    Game.instance.startGame();
    new SetMainGameControlsCommand().execute()
    Game.instance.controller.assignEscKeyPressedCommand(new MainGameEscapeKeyPressedCommand())
    Game.instance.controller.assignPointerLockChangeCommand(new TogglePauseCommand())
  }
}


class ExitGameCommand implements Command {
  public execute(): void {
    Game.instance.endGame()
    new UnsetMainGameControlsCommand().execute();
    new DisplayMenuAndSetMouseControllerCommand(Game.instance.mainMenu).execute()
  }
}


class ShootBulletCommand implements Command {
  constructor(protected player: Player) { }

  public execute(): void {
    const NEW_BULLET: Bullet = new Bullet(this.player)
    Game.instance.bulletsBySelf.push(NEW_BULLET)
  }
}


class RenderViewForPlayerCommand implements Command {
  public execute(): void {
    Canvas.instance.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);

    const ADJACENT_LENGTH_MAGNITUDE: number = (Canvas.WIDTH / 2) / Math.tan(Game.instance.player.fov / 2)
    const PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR: Vector =
      VectorMath.convertYawAndPitchToUnitVector([Game.instance.player.yaw, Game.instance.player.pitch])
    const PLAYER_TO_VIEWPORT_CENTER_VECTOR: Vector =
      VectorMath.convertUnitVectorToVector(PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR, ADJACENT_LENGTH_MAGNITUDE)
    
    // 1 unit vector from the left of the view port to the right
    const PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR: Vector = 
      VectorMath.convertYawAndPitchToUnitVector([Game.instance.player.yaw + Math.PI / 2, 0])
    
    // 1 unit vector from the top of the viewport to the bottom
    let PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR: Vector
    
    if (Game.instance.player.pitch >= 0) {
      PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
        VectorMath.convertYawAndPitchToUnitVector([Game.instance.player.yaw, Game.instance.player.pitch - Math.PI / 2]);
    } else {
      PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
        VectorMath.convertYawAndPitchToUnitVector([Math.PI + Game.instance.player.yaw, -(Math.PI / 2 + Game.instance.player.pitch)]);
    }
    // bruh opposite direction != -1 * yaw, was stuck for 2 hours

    let playerToViewportTopLeftVector: Vector = VectorMath.addVectors(
      PLAYER_TO_VIEWPORT_CENTER_VECTOR,
      VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, -Canvas.WIDTH/2)
    )
    playerToViewportTopLeftVector = VectorMath.addVectors(
      playerToViewportTopLeftVector,
      VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, -Canvas.HEIGHT/2)
    )
    for (let x: number = 0; x < Canvas.WIDTH; x += Game.instance.resolution) {

      for (let y: number = 0; y < Canvas.HEIGHT; y += Game.instance.resolution) {

        let viewportTopLeftToPointVector: Vector =
          VectorMath.addVectors(
            VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, x),
            VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, y)
          );
        let vectorFromPlayerToPoint: Vector = VectorMath.addVectors(playerToViewportTopLeftVector, viewportTopLeftToPointVector)
        let rayAngles: Direction = VectorMath.convertVectorToYawAndPitch(vectorFromPlayerToPoint)

        const RAW_RAY_DISTANCE: number[] = Game.instance.player.castBlockVisionRayVersion2(rayAngles[0], rayAngles[1]);
        
        // custom shading
        // render the pixel
        const COLOR: number[] = PIXEL_COLORS[RAW_RAY_DISTANCE[1]]
        const brightness: number = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 1) * Game.instance.brightnessMultiplier

        Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(COLOR[0] * brightness)},
          ${Math.floor(COLOR[1] * brightness)},
          ${Math.floor(COLOR[2] * brightness)}
          )`)
      }
    }
  }
}


class DisplayMenuAndSetMouseControllerCommand implements Command {
  constructor(private menu: CompositeMenu) { }

  public execute(): void {
    this.menu.drawMenuAndMenuButtons();
    Game.instance.controller.assignMouseClickCommand(new MenuMouseClickedEventHandlerCommand(this.menu));
    Game.instance.controller.assignMouseMoveCommand(undefined)
  }
}


class MainGameEscapeKeyPressedCommand implements Command {
  public execute(): void {
    new LockPointerCommand().execute()
  }
}


class TogglePauseCommand implements Command {

  public execute(): void {
    const IS_PAUSED: boolean = Game.instance.isPaused;
    if (IS_PAUSED) { // if paused, unpause the game
      new SetMainGameControlsCommand().execute()
      Game.instance.brightnessMultiplier = Game.instance.defaultBrightnessMultiplier
      Game.instance.isPaused = false
    } else { // otherwise, pause the game


      // undo the last mouse movement to prevent sudden view changes (unpreventable bug)
      // Since first esc press is not registered by event listener, the only way to toggle
      // pause menu based on a singular click is to detect changes in the state of mouse lock
      // however, the mouse is sometimes unlocked and its movement registered before the change can be detected, 
      // resulting in a sudden shift in mouse movement
      new UndoLastMouseMoveCommand(Game.instance.controller.mouseMoveCommand).execute()
      
      new UnsetMainGameControlsCommand().execute()
      Game.instance.brightnessMultiplier = Game.instance.pauseMenuBrightnessMultiplier
      Game.instance.controller.clearInput();
      Game.instance.isPaused = true
    }
  }
}


abstract class HandleMouseMoveCommand implements Command {
  protected dx: number = 0;
  protected dy: number = 0

  private _previousDX: number | undefined;
  private _previousDY: number | undefined;

  public get previousDX(): number {
    return this._previousDX;
  }

  public get previousDY(): number {
    return this._previousDY
  }

  public assignMovement(dx: number, dy: number): HandleMouseMoveCommand {
    this.dx = dx
    this.dy = dy
    
    this._previousDX = this.dx;
    this._previousDY = this.dy
    return this
  }


  abstract execute(): void;
}


class UndoLastMouseMoveCommand implements Command {
  constructor(protected c: HandleMouseMoveCommand) { }
  
  public execute(): void {
    Game.instance.player.rotatePitch(this.c.previousDY * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity)
    Game.instance.player.rotateYaw(-this.c.previousDX * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity)
  }
}


class MainGameHandleMouseMoveCommand extends HandleMouseMoveCommand implements Command {
  public execute(): void {
    Game.instance.player.rotatePitch(-this.dy * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity)
    Game.instance.player.rotateYaw(this.dx * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity)
  }
}

class UpdatePlayerPositionToFirebaseCommand implements Command {
  constructor(protected player: Player) { }

  public execute(): void {
    update(
      ref(FirebaseClient.instance.db, `/players/${this.player.id}`),
      {
        x: this.player.x, 
        y: this.player.y,
        z: this.player.z,
        color: this.player.colorCode
      }
    )
  }
}


class UpdateBulletPositionToFirebaseCommand implements Command {
  constructor(protected bullet: Bullet) {
    
  }
  public execute(): void {
    update(
      ref(FirebaseClient.instance.db, `/bullets/${this.bullet.id}`),
      {
        x: this.bullet.x, 
        y: this.bullet.y,
        z: this.bullet.z,
        id: this.bullet.id,
        sourcePlayerID: this.bullet.sourcePlayerID
      }
    )
  }
}


class RemoveBulletFromFirebaseCommand implements Command {
  constructor(protected bullet: Bullet) {

  }
  public execute(): void {
    const BULLETS: { x: number, y: number, z: number, id: string, sourcePlayerID: string }[] = Object.values(Game.instance.allBullets)
    for (let i = 0; i < BULLETS.length; i++) {
      if (BULLETS[i].id === this.bullet.id) {
        delete Game.instance.allBullets[this.bullet.id];
        set(ref(FirebaseClient.instance.db, `/bullets`), Game.instance.allBullets)
        return
      }
    }
  }
}

class LockPointerCommand implements Command {
  public execute(): void {
    const havePointerLock = 'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    if (havePointerLock) {
      Canvas.instance.screen.requestPointerLock = Canvas.instance.screen.requestPointerLock ||
        //@ts-ignorets-ignore
        Canvas.instance.screen.mozRequestPointerLock ||
        //@ts-ignorets-ignore
        Canvas.instance.screen.webkitRequestPointerLock;
      

      Canvas.instance.screen.requestPointerLock();
    }
  }
}


class UnlockPointerCommand implements Command {
  public execute(): void {
    document.exitPointerLock = document.exitPointerLock ||
    //@ts-ignorets-ignore
    document.mozExitPointerLock! ||
    //@ts-ignorets-ignore
    document.webkitExitPointerLock!;
  
    document.exitPointerLock();
  }
}


class SetMainGameControlsCommand implements Command {
  public execute(): void {
    Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand())
    Game.instance.controller.assignMouseClickCommand(new MainGameMouseClickedEventHandlerCommand())
  }
}


class UnsetMainGameControlsCommand implements Command {
  public execute(): void {
    Game.instance.controller.assignMouseMoveCommand(undefined)
    Game.instance.controller.assignMouseClickCommand(undefined)
  }
}


class ClearAllPlayersFromDatabaseCommand implements Command {
  public execute(): void {
    set(ref(FirebaseClient.instance.db, `/players`), {})
  }
}


class RemoveClientPlayerFromDatabaseCommand implements Command {
  public execute(): void {
    set(ref(FirebaseClient.instance.db, `/players`), Game.instance.otherPlayers)
  }
}


export {
  Command,
  HandleMouseClickCommand,
  HandleMouseMoveCommand,
  MainGameHandleMouseMoveCommand, 
  DisplayMenuAndSetMouseControllerCommand,
  StartGameCommand,
  MenuMouseClickedEventHandlerCommand,
  MainGameMouseClickedEventHandlerCommand,
  UpdatePlayerPositionToFirebaseCommand,
  ClearAllPlayersFromDatabaseCommand, 
  RemoveClientPlayerFromDatabaseCommand, 
  TogglePauseCommand, 
  LockPointerCommand, 
  ExitGameCommand, 
  RenderViewForPlayerCommand, 
  RemoveBulletFromFirebaseCommand, 
  UpdateBulletPositionToFirebaseCommand
}