import { Canvas } from "./Canvas.js";
import { MouseLockClient } from "./MouseLockClient.js";
class PlayerController {
    player;
    _wKeyPressed = false;
    _aKeyPressed = false;
    _sKeyPressed = false;
    _dKeyPressed = false;
    _escKeyPressed = false;
    _spaceKeyPressed = false;
    mouseLockClient = new MouseLockClient();
    // default is 1
    _sensitivity = 0.5;
    get sensitivity() {
        return this._sensitivity;
    }
    get wKeyPressed() {
        return this._wKeyPressed;
    }
    get aKeyPressed() {
        return this._aKeyPressed;
    }
    get dKeyPressed() {
        return this._dKeyPressed;
    }
    get sKeyPressed() {
        return this._sKeyPressed;
    }
    get spaceKeyPressed() {
        return this._spaceKeyPressed;
    }
    get escKeyPressed() {
        return this._escKeyPressed;
    }
    mousePositionX = 0;
    mousePositionY = 0;
    _mouseClickCommand;
    _mouseMoveCommand;
    _escKeyPressedCommand;
    _pointerLockChangeCommand;
    get mouseClickCommand() {
        return this._mouseClickCommand;
    }
    get mouseMoveCommand() {
        return this._mouseMoveCommand;
    }
    constructor(player) {
        this.player = player;
        document.addEventListener("mousedown", (event) => this.handleMouseClickEvent(event));
        document.addEventListener("mousemove", (e) => this.handleMouseMoveEvent(e));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                this._dKeyPressed = true;
            }
            if (e.key === 'a') {
                this._aKeyPressed = true;
            }
            if (e.key === 'w') {
                this._wKeyPressed = true;
            }
            if (e.key === 's') {
                this._sKeyPressed = true;
            }
            if (e.key === " ") {
                this._spaceKeyPressed = true;
            }
            if (e.key === "Escape") {
                this._escKeyPressed = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'd') {
                this._dKeyPressed = false;
            }
            if (e.key === 'a') {
                this._aKeyPressed = false;
            }
            if (e.key === 'w') {
                this._wKeyPressed = false;
            }
            if (e.key === 's') {
                this._sKeyPressed = false;
            }
            if (e.key === " ") {
                this._spaceKeyPressed = false;
            }
            if (e.key === "Escape") {
                if (this._escKeyPressed === true && this._escKeyPressedCommand !== undefined) {
                    this._escKeyPressedCommand.execute();
                }
                this._escKeyPressed = false;
            }
        });
        document.addEventListener("pointerlockchange", (e) => {
            if (this._pointerLockChangeCommand !== undefined) {
                this._pointerLockChangeCommand.execute();
            }
        });
    }
    clearInput() {
        this._aKeyPressed = false;
        this._wKeyPressed = false;
        this._sKeyPressed = false;
        this._dKeyPressed = false;
        this._spaceKeyPressed = false;
        this._escKeyPressed = false;
    }
    assignMouseClickCommand(c) {
        this._mouseClickCommand = c;
    }
    assignEscKeyPressedCommand(c) {
        this._escKeyPressedCommand = c;
    }
    assignMouseMoveCommand(c) {
        this._mouseMoveCommand = c;
    }
    assignPointerLockChangeCommand(c) {
        this._pointerLockChangeCommand = c;
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
            if (this._mouseClickCommand !== undefined) {
                this._mouseClickCommand
                    .assignType(event.button)
                    .assignCoordinates(this.mousePositionX, this.mousePositionY)
                    .execute();
            }
        }
    }
}
export { PlayerController };
//# sourceMappingURL=PlayerController.js.map