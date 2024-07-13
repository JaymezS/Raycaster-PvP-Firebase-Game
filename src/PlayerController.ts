import { HandleMouseClickCommand, HandleMouseMoveCommand, Command } from "./Command.js";
import { Canvas } from "./Canvas.js";
import { Player } from "./Player.js";


class PlayerController {
  private _wKeyPressed: boolean = false;
  private _aKeyPressed: boolean = false;
  private _sKeyPressed: boolean = false;
  private _dKeyPressed: boolean = false;
  private _escKeyPressed: boolean = false
  private _spaceKeyPressed: boolean = false;

  private mousePositionX: number = 0;
  private mousePositionY: number = 0;
  private _mouseClickCommand: HandleMouseClickCommand | undefined;
  private _mouseMoveCommand: HandleMouseMoveCommand | undefined;

  private _escKeyPressedCommand: Command | undefined;
  private _pointerLockChangeCommand: Command | undefined;

  // default is 1
  private _sensitivity: number = 0.5;

  public get sensitivity(): number {
    return this._sensitivity;
  }

  public get wKeyPressed(): boolean {
    return this._wKeyPressed;
  }

  
  public get aKeyPressed(): boolean {
    return this._aKeyPressed;
  }

  
  public get dKeyPressed(): boolean {
    return this._dKeyPressed;
  }

  
  public get sKeyPressed(): boolean {
    return this._sKeyPressed;
  }

  public get spaceKeyPressed(): boolean {
    return this._spaceKeyPressed;
  }

  public get escKeyPressed(): boolean {
    return this._escKeyPressed;
  }



  public get mouseClickCommand(): HandleMouseClickCommand | undefined {
    return this._mouseClickCommand;
  }

  public get mouseMoveCommand(): HandleMouseMoveCommand | undefined {
    return this._mouseMoveCommand;
  }


  constructor(readonly player: Player) {
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
    })
  }


  public clearInput(): void {
    this._aKeyPressed = false;
    this._wKeyPressed = false;
    this._sKeyPressed = false;
    this._dKeyPressed = false;
    this._spaceKeyPressed = false;
    this._escKeyPressed = false;
  }


  public assignMouseClickCommand(c: HandleMouseClickCommand | undefined) {
    this._mouseClickCommand = c;
  }

  public assignEscKeyPressedCommand(c: Command | undefined): void {
    this._escKeyPressedCommand = c;
  } 

  public assignMouseMoveCommand(c: HandleMouseMoveCommand | undefined): void {
    this._mouseMoveCommand = c;
  }

  public assignPointerLockChangeCommand(c: Command | undefined): void {
    this._pointerLockChangeCommand = c;
  }

  private handleMouseMoveEvent(event: MouseEvent): void {
    if (this._mouseMoveCommand !== undefined) {
      this._mouseMoveCommand.assignMovement(event.movementX, event.movementY).execute();
    }
  }


  private handleMouseClickEvent(event: MouseEvent): void {
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
      if (this._mouseClickCommand !== undefined) {
        this._mouseClickCommand
          .assignType(event.button)
          .assignCoordinates(this.mousePositionX, this.mousePositionY)
          .execute();
      }
    }
  }
}


export {PlayerController}