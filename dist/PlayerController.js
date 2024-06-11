"use strict";
class PlayerController {
    player;
    wKeyPressed = false;
    aKeyPressed = false;
    sKeyPressed = false;
    dKeyPressed = false;
    spaceKeyPressed = false;
    constructor(player) {
        this.player = player;
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
}
//# sourceMappingURL=PlayerController.js.map