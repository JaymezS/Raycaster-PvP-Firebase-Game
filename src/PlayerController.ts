class PlayerController {
  private wKeyPressed: boolean = false;
  private aKeyPressed: boolean = false;
  private sKeyPressed: boolean = false;
  private dKeyPressed: boolean = false;

  constructor(readonly player: Player) {
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

    document.addEventListener("mousemove", (e) => {
      
      this.player.rotatePitch(e.movementY * this.player.rotationSpeed)
      this.player.rotateYaw(e.movementX * this.player.rotationSpeed)
    })
  }

  public updatePlayer() {
    if (this.dKeyPressed) {
      this.player.moveRight()
    }
    if (this.aKeyPressed) {
      this.player.moveLeft()
    }
    if (this.wKeyPressed) {
      this.player.moveForward()
    }
    if (this.sKeyPressed) {
      this.player.moveBackward()
    }
  }
}