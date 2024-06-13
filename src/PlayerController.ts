import { HandleMouseClickCommand, HandleMouseMoveCommand } from "./Command.js";
import { Canvas } from "./Canvas.js";
import { Player } from "./Player.js";



class PlayerController {
  private wKeyPressed: boolean = false;
  private aKeyPressed: boolean = false;
  private sKeyPressed: boolean = false;
  private dKeyPressed: boolean = false;
  private spaceKeyPressed: boolean = false;

  // default is 1
  private _sensitivity: number = 0.5;

  public get sensitivity(): number {
    return this._sensitivity
  }

  public updatePlayer() {
    if (this.dKeyPressed) {
      this.player.isAcceleratingRight = true
    } else {
      this.player.isAcceleratingRight = false
    }
    if (this.aKeyPressed) {
      this.player.isAcceleratingLeft = true
    } else {
      this.player.isAcceleratingLeft = false
    }
    if (this.wKeyPressed) {
      this.player.isAcceleratingForward = true
    } else {
      this.player.isAcceleratingForward = false
    }
    if (this.sKeyPressed) {
      this.player.isAcceleratingBackward = true
    } else {
      this.player.isAcceleratingBackward = false
    }
    if (this.spaceKeyPressed) {
      this.player.jump();
    }
    this.player.updatePosition()
  }

  protected mousePositionX: number = 0;
  protected mousePositionY: number = 0;
  private _mouseClickCommand: HandleMouseClickCommand | undefined;
  private _mouseMoveCommand: HandleMouseMoveCommand | undefined


  public get mouseClickCommand(): HandleMouseClickCommand | undefined {
    return this._mouseClickCommand
  }

  public get mouseMoveCommand(): HandleMouseMoveCommand | undefined {
    return this._mouseMoveCommand
  }


  constructor(readonly player: Player) {
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
        this.spaceKeyPressed = false
      }
    });

    document.addEventListener("mousemove", (e) => this.handleMouseMoveEvent(e))
  }

  public assignMouseClickCommand(c: HandleMouseClickCommand | undefined) {
    this._mouseClickCommand = c;
  }

  public assignMouseMoveCommand(c: HandleMouseMoveCommand | undefined) {
    this._mouseMoveCommand = c
  }

  private handleMouseMoveEvent(event: MouseEvent) {
    if (this._mouseMoveCommand !== undefined) {
      this._mouseMoveCommand.assignMovement(event.movementX, event.movementY).execute()
    }
  }


  private handleMouseClickEvent(event: MouseEvent) {
    const MOUSE_X: number = event.clientX;
    const MOUSE_Y: number = event.clientY;

    // where the element "BoundingRect is on the screen"
    const BoundingRect = Canvas.instance.screen.getBoundingClientRect();
    const CANVAS_X: number = BoundingRect.x;
    const CANVAS_Y: number = BoundingRect.y;
    const MOUSE_POSITION_X: number = MOUSE_X - CANVAS_X;
    const MOUSE_POSITION_Y: number = MOUSE_Y - CANVAS_Y;
    this.mousePositionX = MOUSE_POSITION_X;
    this.mousePositionY = MOUSE_POSITION_Y;
    if (
      this.mousePositionY < Canvas.HEIGHT &&
      this.mousePositionX < Canvas.WIDTH &&
      this.mousePositionX >= 0 &&
      this.mousePositionY >= 0
    ) {
      if (this._mouseClickCommand === undefined) {
        throw new Error("no on click command assigned");
      } else {
        this._mouseClickCommand
          .assignCoordinates(this.mousePositionX, this.mousePositionY)
          .execute();
      }
    }
  }
}


export {PlayerController}