import { PlayerController } from "./PlayerController.js";
import { Canvas } from "./Canvas.js";
import { DisplayMenuAndSetMouseControllerCommand, StartGameCommand } from "./Command.js";
import { Utilities } from "./Utilities.js";
import { Player } from "./Player.js";
import { GameMap } from "./Map.js";
import { CompositeMenu, MenuButton } from "./Menu.js";
import { PIXEL_COLORS } from "./Map.js";
import { set, onDisconnect, ref, onValue,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
class Game {
    static _instance;
    player = new Player();
    gameMap = new GameMap();
    controller = new PlayerController(this.player);
    context = Canvas.instance.context;
    gameLoop = undefined;
    FPS = 60;
    timeInterval = 1000 / this.FPS;
    resolution = 8;
    gravitationalAccelerationConstant = 1;
    terminalVelocity = 20;
    maxRenderDistance = 8 * GameMap.tileSize;
    mainMenu = new CompositeMenu("main menu");
    players = {};
    constructor() {
        this.composeMainMenu();
        onDisconnect(set(ref(FirebaseClient.instance.db, "/players"), this.players));
    }
    start() {
        new DisplayMenuAndSetMouseControllerCommand(this.mainMenu).execute();
    }
    updateFromDatabase() {
        onValue(ref(FirebaseClient.instance.db, "/players"), (snapshot) => {
            if (snapshot.val()) {
                this.players = snapshot.val();
                //Remove the player, but keep all the other users
                delete this.players[this.player.id];
            }
        }, { onlyOnce: true });
    }
    startGame() {
        this.gameLoop = setInterval(() => {
            this.updateFromDatabase();
            this.player.updateVerticalMovementDueToGravity();
            this.controller.updatePlayer();
            this.renderForPlayer(this.player);
        }, this.timeInterval);
    }
    composeMainMenu() {
        const START_BUTTON = new MenuButton(Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2, Canvas.HEIGHT / 2 - MenuButton.buttonHeight / 2, "start game");
        START_BUTTON.addCommand(new StartGameCommand());
        this.mainMenu.addMenuButton(START_BUTTON);
    }
    endGame() {
        clearInterval(this.gameLoop);
    }
    clearScreen() {
        this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    }
    renderForPlayer(player) {
        this.clearScreen();
        const TIME = performance.now();
        for (let x = 0; x < Canvas.WIDTH; x += this.resolution) {
            for (let y = 0; y < Canvas.HEIGHT; y += this.resolution) {
                const CURRENT_RAY_YAW = (player.yaw - player.fov / 2) + (x / Canvas.WIDTH) * player.fov;
                const CURRENT_RAY_PITCH = (player.pitch + player.fov / 4) - (y / Canvas.HEIGHT) * player.fov / 2;
                const RAW_RAY_DISTANCE = player.castBlockVisionRay(CURRENT_RAY_YAW, CURRENT_RAY_PITCH);
                // cos angle = distance to wall (adj) / raw ray distance (hyp)
                // distance to wall = raw distance * cos angle
                // angle = ray angle - player angle (or vice versa doesn't matter)
                // old calculations and corrections for 2d raycast
                // const CORRECTED_DISTANCE = RAW_RAY_RESULTS[0] * Math.cos(player.angle - CURRENT_RAY_ANGLE);
                // const WALL_LINE_HEIGHT = GameMap.tileSize / CORRECTED_DISTANCE * Canvas.HEIGHT;
                // const LINE_START_POSITION = Canvas.HEIGHT/2 - WALL_LINE_HEIGHT/2;
                // const LINE_END_POSITION = Canvas.HEIGHT/2 + WALL_LINE_HEIGHT/2;
                // custom shading
                // render the pixel
                const COLOR = PIXEL_COLORS[RAW_RAY_DISTANCE[1]];
                const brightness = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 0.5);
                Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(COLOR[0] * brightness)},
          ${Math.floor(COLOR[1] * brightness)},
          ${Math.floor(COLOR[2] * brightness)}
          )`);
            }
        }
        const TIME_TWO = performance.now();
        const TIME_DIFF = TIME_TWO - TIME;
        this.context.font = "24px Arial";
        this.context.fillStyle = "white";
        this.context.fillText(`MAX FPS: ${Math.round(1000 / TIME_DIFF)}`, 50, 50);
    }
    static get instance() {
        if (Game._instance === undefined) {
            Game._instance = new Game();
        }
        return Game._instance;
    }
}
export { Game };
//# sourceMappingURL=Game.js.map