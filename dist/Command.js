import { Game } from "./Game.js";
import { update, ref, set
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
class HandleMouseClickCommand {
    mousePositionX = 0;
    mousePositionY = 0;
    // either do this or get the coordinates directly from controller in the execute
    // (if having an extra method in commands are not allowed)
    assignCoordinates(x, y) {
        this.mousePositionX = x;
        this.mousePositionY = y;
        return this;
    }
}
class MainGameMouseClickedEventHandlerCommand extends HandleMouseClickCommand {
    execute() { }
}
class MenuMouseClickedEventHandlerCommand extends HandleMouseClickCommand {
    menu;
    constructor(menu) {
        super();
        this.menu = menu;
    }
    execute() {
        for (let button of this.menu.buttons) {
            if (button.checkCoordinatesOnButton(this.mousePositionX, this.mousePositionY)) {
                button.executeCommand();
                break;
            }
        }
    }
}
class StartGameCommand {
    execute() {
        Game.instance.startGame();
        Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand());
        Game.instance.controller.assignMouseClickCommand(new MainGameMouseClickCommand());
    }
}
class DisplayMenuAndSetMouseControllerCommand {
    menu;
    constructor(menu) {
        this.menu = menu;
    }
    execute() {
        this.menu.drawMenuAndMenuButtons();
        Game.instance.controller.assignMouseClickCommand(new MenuMouseClickedEventHandlerCommand(this.menu));
    }
}
class HandleMouseMoveCommand {
    dx = 0;
    dy = 0;
    assignMovement(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        return this;
    }
}
class MainGameHandleMouseMoveCommand extends HandleMouseMoveCommand {
    execute() {
        Game.instance.player.rotatePitch(this.dy * Game.instance.player.rotationSpeed * -1);
        Game.instance.player.rotateYaw(this.dx * Game.instance.player.rotationSpeed);
    }
}
class UpdatePlayerPositionToFirebaseCommand {
    player;
    constructor(player) {
        this.player = player;
    }
    execute() {
        update(ref(FirebaseClient.instance.db, `/players/${this.player.id}`), {
            x: this.player.x,
            y: this.player.y,
            z: this.player.z,
            color: this.player.colorCode
        });
    }
}
class MainGameMouseClickCommand extends HandleMouseClickCommand {
    execute() {
        new ToggleMouseMovementCommand().execute();
    }
}
class ToggleMouseMovementCommand {
    execute() {
        if (Game.instance.controller.mouseMoveCommand === undefined) {
            Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand());
        }
        else {
            Game.instance.controller.assignMouseMoveCommand(undefined);
        }
    }
}
class ClearAllPlayersFromDatabaseCommand {
    execute() {
        set(ref(FirebaseClient.instance.db, `/players`), {});
    }
}
export { HandleMouseClickCommand, HandleMouseMoveCommand, MainGameHandleMouseMoveCommand, DisplayMenuAndSetMouseControllerCommand, StartGameCommand, MenuMouseClickedEventHandlerCommand, MainGameMouseClickedEventHandlerCommand, UpdatePlayerPositionToFirebaseCommand, ClearAllPlayersFromDatabaseCommand };
//# sourceMappingURL=Command.js.map