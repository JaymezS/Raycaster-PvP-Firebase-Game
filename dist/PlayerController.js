"use strict";
class PlayerController {
    player;
    wKeyPressed = false;
    aKeyPressed = false;
    sKeyPressed = false;
    dKeyPressed = false;
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
        });
    }
    updatePlayer() {
        if (this.dKeyPressed) {
            this.player.rotateRight();
        }
        if (this.aKeyPressed) {
            this.player.rotateLeft();
        }
        if (this.wKeyPressed) {
            this.player.moveForward();
        }
        if (this.sKeyPressed) {
            this.player.moveBackward();
        }
    }
}
//# sourceMappingURL=PlayerController.js.map