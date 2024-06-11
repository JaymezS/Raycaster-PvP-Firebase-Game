interface Command {
  execute(): void;
}

abstract class HandleMouseClickCommand implements Command {
  
  protected mousePositionX: number = 0
  protected mousePositionY: number = 0

  // either do this or get the coordinates directly from controller in the execute
  // (if having an extra method in commands are not allowed)
  public assignCoordinates(x: number, y: number): Command {
    this.mousePositionX = x;
    this.mousePositionY = y;
    return this
  }

  abstract execute(): void;
}



class MainGameMouseClickedEventHandlerCommand extends HandleMouseClickCommand{
  public execute(): void { }

}


class MenuMouseClickedEventHandlerCommand extends HandleMouseClickCommand {
  constructor(private menu: CompositeMenu) {
    super();
  }

  public execute(): void {
    for (let button of this.menu.buttons) {
      if (button.checkCoordinatesOnButton(this.mousePositionX, this.mousePositionY)) {
        button.executeCommand();
        break;
      }
    }
  }
}
