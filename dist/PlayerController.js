import { Canvas } from "./Canvas.js";
class PlayerController {
    player;
    wKeyPressed = false;
    aKeyPressed = false;
    sKeyPressed = false;
    dKeyPressed = false;
    spaceKeyPressed = false;
    // default is 1
    _sensitivity = 0.5;
    get sensitivity() {
        return this._sensitivity;
    }
    updatePlayer() {
        if (this.dKeyPressed) {
            this.player.isAcceleratingRight = true;
        }
        else {
            this.player.isAcceleratingRight = false;
        }
        if (this.aKeyPressed) {
            this.player.isAcceleratingLeft = true;
        }
        else {
            this.player.isAcceleratingLeft = false;
        }
        if (this.wKeyPressed) {
            this.player.isAcceleratingForward = true;
        }
        else {
            this.player.isAcceleratingForward = false;
        }
        if (this.sKeyPressed) {
            this.player.isAcceleratingBackward = true;
        }
        else {
            this.player.isAcceleratingBackward = false;
        }
        if (this.spaceKeyPressed) {
            this.player.jump();
        }
        this.player.updatePosition();
    }
    mousePositionX = 0;
    mousePositionY = 0;
    _mouseClickCommand;
    _mouseMoveCommand;
    get mouseClickCommand() {
        return this._mouseClickCommand;
    }
    get mouseMoveCommand() {
        return this._mouseMoveCommand;
    }
    constructor(player) {
        this.player = player;
        document.addEventListener("mousedown", (event) => this.handleMouseClickEvent(event));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                this.dKeyPressed = true;
            }
            if (e.key === 'a') {
                this.aKeyPressed = true;
            }
            if (e.key === 'w') {
                this.wKeyPressed = true;
            }
            if (e.key === 's') {
                this.sKeyPressed = true;
            }
            if (e.key === " ") {
                this.spaceKeyPressed = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'd') {
                this.dKeyPressed = false;
            }
            if (e.key === 'a') {
                this.aKeyPressed = false;
            }
            if (e.key === 'w') {
                this.wKeyPressed = false;
            }
            if (e.key === 's') {
                this.sKeyPressed = false;
            }
            if (e.key === " ") {
                this.spaceKeyPressed = false;
            }
        });
        document.addEventListener("mousemove", (e) => this.handleMouseMoveEvent(e));
    }
    assignMouseClickCommand(c) {
        this._mouseClickCommand = c;
    }
    assignMouseMoveCommand(c) {
        this._mouseMoveCommand = c;
    }
    handleMouseMoveEvent(event) {
        if (this._mouseMoveCommand !== undefined) {
            this._mouseMoveCommand.assignMovement(event.movementX, event.movementY).execute();
        }
    }
    handleMouseClickEvent(event) {
        const MOUSE_X = event.clientX;
        const MOUSE_Y = event.clientY;
        // where the element "BoundingRect is on the screen"
        const BoundingRect = Canvas.instance.screen.getBoundingClientRect();
        const CANVAS_X = BoundingRect.x;
        const CANVAS_Y = BoundingRect.y;
        const MOUSE_POSITION_X = MOUSE_X - CANVAS_X;
        const MOUSE_POSITION_Y = MOUSE_Y - CANVAS_Y;
        this.mousePositionX = MOUSE_POSITION_X;
        this.mousePositionY = MOUSE_POSITION_Y;
        if (this.mousePositionY < Canvas.HEIGHT &&
            this.mousePositionX < Canvas.WIDTH &&
            this.mousePositionX >= 0 &&
            this.mousePositionY >= 0) {
            if (this._mouseClickCommand === undefined) {
                throw new Error("no on click command assigned");
            }
            else {
                this._mouseClickCommand
                    .assignCoordinates(this.mousePositionX, this.mousePositionY)
                    .execute();
            }
        }
    }
}
export { PlayerController };
//# sourceMappingURL=PlayerController.js.map