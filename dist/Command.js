"use strict";
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
//# sourceMappingURL=Command.js.map