import { CompositeMenu } from "./Menu.js";
import { Game } from "./Game.js";
import { Player } from "./Player.js";
import {
  update,
  ref,
  //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";

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
    Game.instance.player.rotatePitch(this.dy * Game.instance.player.rotationSpeed * -1)
    Game.instance.player.rotateYaw(this.dx * Game.instance.player.rotationSpeed)
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
    if (Game.instance.controller.mouseMoveCommand === undefined) {
      Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand())
    } else {
      Game.instance.controller.assignMouseMoveCommand(undefined)
    }
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
  UpdatePlayerPositionToFirebaseCommand
}