"use strict";
class PlayerController {
    player;
    wKeyPressed = false;
    aKeyPressed = false;
    sKeyPressed = false;
    dKeyPressed = false;
    spaceKeyPressed = false;
    updatePlayer() {
        if (this.dKeyPressed) {
            this.player.moveRight();
        }
        if (this.aKeyPressed) {
            this.player.moveLeft();
        }
        if (this.wKeyPressed) {
            this.player.moveForward();
        }
        if (this.sKeyPressed) {
            this.player.moveBackward();
        }
        if (this.spaceKeyPressed) {
            this.player.jump();
        }
    }
    mousePositionX = 0;
    mousePositionY = 0;
    mouseClickCommand;
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
        document.addEventListener("mousemove", (e) => {
            this.player.rotatePitch(e.movementY * this.player.rotationSpeed);
            this.player.rotateYaw(e.movementX * this.player.rotationSpeed);
        });
    }
    assignMouseClickCommand(c) {
        this.mouseClickCommand = c;
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
            if (this.mouseClickCommand === undefined) {
                throw new Error("no on click command assigned");
            }
            else {
                this.mouseClickCommand
                    .assignCoordinates(this.mousePositionX, this.mousePositionY)
                    .execute();
            }
        }
    }
}
//# sourceMappingURL=PlayerController.js.map