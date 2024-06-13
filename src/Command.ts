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
  public execute(): void { }

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
    Game.instance.startGame()
    Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand())
    Game.instance.controller.assignMouseClickCommand(new MainGameMouseClickCommand())
  }
}


class DisplayMenuAndSetMouseControllerCommand implements Command {
  constructor(private menu: CompositeMenu) { }

  public execute(): void {
    this.menu.drawMenuAndMenuButtons();
    Game.instance.controller.assignMouseClickCommand(new MenuMouseClickedEventHandlerCommand(this.menu));
  }
}


abstract class HandleMouseMoveCommand implements Command {
  protected dx: number = 0;
  protected dy: number = 0
  public assignMovement(dx: number, dy: number): HandleMouseMoveCommand {
    this.dx = dx
    this.dy = dy
    return this
  }

  abstract execute(): void;
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


class MainGameMouseClickCommand extends HandleMouseClickCommand implements Command {
  public execute(): void {
    new ToggleMouseMovementCommand().execute()
  }
}


class ToggleMouseMovementCommand implements Command {
  public execute(): void {
    const havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    if (havePointerLock) {
      if (Game.instance.controller.mouseMoveCommand === undefined) {
        Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand())

        Canvas.instance.screen.requestPointerLock = Canvas.instance.screen.requestPointerLock ||
          //@ts-ignorets-ignore
          Canvas.instance.screen.mozRequestPointerLock ||
          //@ts-ignorets-ignore
          Canvas.instance.screen.webkitRequestPointerLock;
        
        Canvas.instance.screen.requestPointerLock();
      } else {
        Game.instance.controller.assignMouseMoveCommand(undefined)
        // Ask the browser to release the pointer
        document.exitPointerLock = document.exitPointerLock ||
          //@ts-ignorets-ignore
          document.mozExitPointerLock! ||
          //@ts-ignorets-ignore
          document.webkitExitPointerLock!;
        
        document.exitPointerLock();
      }
    }
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
  RemoveClientPlayerFromDatabaseCommand
}