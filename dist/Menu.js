import { Rectangle } from "./Shapes.js";
import { Canvas } from "./Canvas.js";
class MenuButton extends Rectangle {
    title;
    static buttonWidth = 100;
    static buttonHeight = 60;
    command;
    constructor(x, y, title, color = "black", width = MenuButton.buttonWidth, height = MenuButton.buttonHeight) {
        super(x, y, color, width, height);
        this.title = title;
    }
    addCommand(c) {
        this.command = c;
        return this;
    }
    executeCommand() {
        if (!(this.command === undefined)) {
            this.command.execute();
        }
        else {
            throw new Error("command not assigned to button");
        }
    }
    draw() {
        super.draw();
        Canvas.instance.context.fillStyle = "white";
        Canvas.instance.context.font = "16px Arial";
        const TEXT_WIDTH = 8 * this.title.length;
        if (TEXT_WIDTH >= this.width * 4 / 5) {
            const WORDS = this.title.split(" ");
            for (let i = 0; i < WORDS.length; i++) {
                const WORD = WORDS[i];
                const WORD_SIZE = 8 * WORD.length;
                Canvas.instance.context.fillText(`${WORD}`, this.x + this.width / 2 - WORD_SIZE / 2, this.y + this.height / (WORDS.length + 1) * (i + 1));
            }
        }
        else {
            Canvas.instance.context.fillText(`${this.title}`, this.x + this.width / 5, this.y + this.height / 2);
        }
    }
    checkCoordinatesOnButton(x, y) {
        if (x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height) {
            return true;
        }
        return false;
    }
}
class CompositeMenu {
    title;
    _buttons = [];
    command;
    renderBackgroundCommand;
    displayElementCommands = [];
    constructor(title) {
        this.title = title;
    }
    addCommand(c) {
        this.command = c;
        return this;
    }
    addDisplayElementCommand(c) {
        this.displayElementCommands.push(c);
        return this;
    }
    assignRenderBackgroundCommand(c) {
        this.renderBackgroundCommand = c;
        return this;
    }
    get buttons() {
        return this._buttons;
    }
    executeCommand() {
        if (!(this.command === undefined)) {
            this.command.execute();
        }
        else {
            throw new Error("command not assigned to button");
        }
    }
    drawAllButtons() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].draw();
        }
    }
    addMenuButton(item) {
        this.buttons.push(item);
        return this;
    }
    drawMenuAndMenuButtons() {
        if (this.renderBackgroundCommand === undefined) {
            Canvas.instance.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
        }
        else {
            this.renderBackgroundCommand.execute();
        }
        const TEXT_WIDTH = 20 * this.title.length;
        Canvas.instance.context.fillStyle = "blue";
        Canvas.instance.context.font = "40px Arial";
        Canvas.instance.context.fillText(`${this.title}`, Canvas.WIDTH / 2 - TEXT_WIDTH / 2, Canvas.HEIGHT / 4);
        this.drawAllButtons();
        for (let command of this.displayElementCommands) {
            command.execute();
        }
    }
}
export { CompositeMenu, MenuButton };
//# sourceMappingURL=Menu.js.map