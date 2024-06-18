import { Command } from "./Command.js";
import { Rectangle } from "./Shapes.js";
import { Canvas } from "./Canvas.js";


interface MenuProperties {
  addCommand(Command: Command): MenuProperties;
  executeCommand(): void;
}


class MenuButton extends Rectangle implements MenuProperties {
  public static buttonWidth: number = 100;
  public static buttonHeight: number = 60;
  private command: Command | undefined;

  constructor(
    x: number,
    y: number,
    protected title: string,
    color: string = "black",
    width: number = MenuButton.buttonWidth,
    height: number = MenuButton.buttonHeight
  ) {
    super(x, y, color, width, height);
  }

  public addCommand(c: Command): MenuProperties {
    this.command = c;
    return this;
  }

  public executeCommand(): void {
    if (!(this.command === undefined)) {
      this.command.execute();
    } else {
      throw new Error("command not assigned to button");
    }
  }

  public draw(): void {
    super.draw()
    Canvas.instance.context.fillStyle = "white";
    Canvas.instance.context.font = "16px Arial";
    const TEXT_WIDTH: number = 8 * this.title.length;
    if (TEXT_WIDTH >= this.width * 4 / 5) {
      const WORDS: string[] = this.title.split(" ");
      for (let i = 0; i < WORDS.length; i++) {
        const WORD: string = WORDS[i];
        const WORD_SIZE: number = 8 * WORD.length;
        Canvas.instance.context.fillText(
          `${WORD}`,
          this.x + this.width / 2 - WORD_SIZE / 2,
          this.y + this.height / (WORDS.length + 1) * (i + 1)
        );
      }
    } else {
      Canvas.instance.context.fillText(
        `${this.title}`, this.x + this.width / 5, this.y + this.height / 2
      );
    }
  }

  public checkCoordinatesOnButton(x: number, y: number): boolean {
    if (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    ) {
      return true;
    }
    return false;
  }
}


class CompositeMenu implements MenuProperties {
  protected _buttons: MenuButton[] = [];
  protected command: Command | undefined;
  protected renderBackgroundCommand: Command | undefined
  protected displayElementCommands: Command[] = [];

  constructor(protected title: string) { }

  public addCommand(c: Command): CompositeMenu {
    this.command = c;
    return this;
  }

  public addDisplayElementCommand(c: Command): CompositeMenu {
    this.displayElementCommands.push(c)
    return this
  }

  public assignRenderBackgroundCommand(c: Command): CompositeMenu {
    this.renderBackgroundCommand = c
    return this
  }

  public get buttons(): MenuButton[] {
    return this._buttons;
  }

  public executeCommand(): void {
    if (!(this.command === undefined)) {
      this.command.execute();
    } else {
      throw new Error("command not assigned to button");
    }
  }

  public drawAllButtons(): void {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw();
    }
  }

  public addMenuButton(item: MenuButton): CompositeMenu {
    this.buttons.push(item);
    return this;
  }

  public drawMenuAndMenuButtons(): void {
    if (this.renderBackgroundCommand === undefined) {
      Canvas.instance.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    } else {
      this.renderBackgroundCommand.execute()
    }
    const TEXT_WIDTH: number = 20 * this.title.length;
    Canvas.instance.context.fillStyle = "blue";
    Canvas.instance.context.font = "40px Arial";
    Canvas.instance.context.fillText(
      `${this.title}`,
      Canvas.WIDTH / 2 - TEXT_WIDTH / 2,
      Canvas.HEIGHT / 4
    );
    this.drawAllButtons();
    for (let command of this.displayElementCommands) {
      command.execute()
    }
  }
}


export {CompositeMenu, MenuButton}