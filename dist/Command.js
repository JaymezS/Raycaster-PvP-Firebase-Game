import { Game } from "./Game.js";
import { update, ref, set
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
import { Canvas } from "./Canvas.js";
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
        Canvas.instance.screen.requestPointerLock();
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
        Game.instance.player.rotatePitch(-this.dy * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity);
        Game.instance.player.rotateYaw(this.dx * Game.instance.player.rotationSpeed * Game.instance.controller.sensitivity);
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
        const havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        if (havePointerLock) {
            if (Game.instance.controller.mouseMoveCommand === undefined) {
                Game.instance.controller.assignMouseMoveCommand(new MainGameHandleMouseMoveCommand());
                Canvas.instance.screen.requestPointerLock = Canvas.instance.screen.requestPointerLock ||
                    //@ts-ignorets-ignore
                    Canvas.instance.screen.mozRequestPointerLock ||
                    //@ts-ignorets-ignore
                    Canvas.instance.screen.webkitRequestPointerLock;
                Canvas.instance.screen.requestPointerLock();
            }
            else {
                Game.instance.controller.assignMouseMoveCommand(undefined);
                // Ask the browser to release the pointer
                document.exitPointerLock = document.exitPointerLock ||
                    //@ts-ignorets-ignore
                    document.mozExitPointerLock ||
                    //@ts-ignorets-ignore
                    document.webkitExitPointerLock;
                document.exitPointerLock();
            }
        }
    }
}
class ClearAllPlayersFromDatabaseCommand {
    execute() {
        set(ref(FirebaseClient.instance.db, `/players`), {});
    }
}
class RemoveClientPlayerFromDatabaseCommand {
    execute() {
        set(ref(FirebaseClient.instance.db, `/players`), Game.instance.otherPlayers);
    }
}
export { HandleMouseClickCommand, HandleMouseMoveCommand, MainGameHandleMouseMoveCommand, DisplayMenuAndSetMouseControllerCommand, StartGameCommand, MenuMouseClickedEventHandlerCommand, MainGameMouseClickedEventHandlerCommand, UpdatePlayerPositionToFirebaseCommand, ClearAllPlayersFromDatabaseCommand, RemoveClientPlayerFromDatabaseCommand };
//# sourceMappingURL=Command.js.map