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
//# sourceMappingURL=Command.js.map