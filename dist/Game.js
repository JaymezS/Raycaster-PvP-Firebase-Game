import { PlayerController } from "./PlayerController.js";
import { Canvas } from "./Canvas.js";
import { DisplayMenuAndSetMouseControllerCommand, RemoveClientPlayerFromDatabaseCommand, StartGameCommand } from "./Command.js";
import { Utilities } from "./Utilities.js";
import { Player } from "./Player.js";
import { GameMap } from "./Map.js";
import { CompositeMenu, MenuButton } from "./Menu.js";
import { PIXEL_COLORS } from "./Map.js";
import { ref, onValue,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./FirebaseClient.js";
import { VectorMath } from "./Vector.js";
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
    otherPlayers = {};
    constructor() {
        this.composeMainMenu();
        window.addEventListener("beforeunload", function (e) {
            Game.instance.endGame();
            new RemoveClientPlayerFromDatabaseCommand().execute();
        });
    }
    start() {
        new DisplayMenuAndSetMouseControllerCommand(this.mainMenu).execute();
    }
    updateFromDatabase() {
        onValue(ref(FirebaseClient.instance.db, "/players"), (snapshot) => {
            if (snapshot.val()) {
                this.otherPlayers = snapshot.val();
                //Remove the player, but keep all the other users
                delete this.otherPlayers[this.player.id];
            }
        }, { onlyOnce: true });
    }
    startGame() {
        this.gameLoop = setInterval(() => {
            this.updateFromDatabase();
            this.player.updateVerticalMovementDueToGravity();
            this.controller.updatePlayer();
            this.renderForPlayer();
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
    renderForPlayer() {
        this.clearScreen();
        const TIME = performance.now();
        const ADJACENT_LENGTH_MAGNITUDE = (Canvas.WIDTH / 2) / Math.tan(this.player.fov / 2);
        const PLAYER_TO_VIEWPORT_UNIT_VECTOR = VectorMath.convertYawAndPitchToUnitVector([this.player.yaw, this.player.pitch]);
        const PLAYER_TO_VIEWPORT_VECTOR = VectorMath.convertUnitVectorToVector(PLAYER_TO_VIEWPORT_UNIT_VECTOR, ADJACENT_LENGTH_MAGNITUDE);
        for (let x = 0; x < Canvas.WIDTH; x += this.resolution) {
            // default ray cast
            // const CURRENT_RAY_YAW = (this.player.yaw - this.player.fov / 2) +
            //   (x / Canvas.WIDTH) * this.player.fov;
            // attempted fix to gradient
            let rayAngleYaw = Utilities.calculateAngleFromLeftOfCone(this.player.fov, Canvas.WIDTH, x);
            // problem lies in this line, should not add, but use a formula to combine the two
            // ie imagine the player is looking up, the player's viewport is a plane not paralle to any axial planes
            // therefore, when viewed from above, the player's viewport's vertices have different yaws
            // 
            // fix: since player's angle can be expressed as a vector, do that, then for every pixel, express it as a vector from the center of the viewport plane, then perform vector addition, and convert the resultant back to yaw and pitch
            // note that conversion must first be done to incoporate Canvas size as a part of the viewport plane.
            // with this fix, x and y would not be seperate, each pair of x and y will generate a unique resultant vector, and thereby a unique pitch and yaw
            rayAngleYaw += (this.player.yaw - this.player.fov / 2);
            for (let y = 0; y < Canvas.HEIGHT; y += this.resolution) {
                const VERTICAL_FOV = Canvas.HEIGHT / Canvas.WIDTH * this.player.fov;
                // old ray pitch
                // const CURRENT_RAY_PITCH = (this.player.pitch + VERTICAL_FOV / 2) -
                //   (y / Canvas.HEIGHT) * VERTICAL_FOV
                // attempted fix to gradient
                // Note that this does nothing right now
                let rayAnglePitch = Utilities.calculateAngleFromLeftOfCone(VERTICAL_FOV, Canvas.HEIGHT, y);
                rayAnglePitch = (this.player.pitch + VERTICAL_FOV / 2) - rayAnglePitch;
                let centerOfViewportToPointVector;
                let vectorFromPlayerToPoint = VectorMath.addVectors(PLAYER_TO_VIEWPORT_VECTOR, centerOfViewportToPointVector);
                let rayAngles = VectorMath.convertVectorToYawAndPitch(vectorFromPlayerToPoint);
                // replace with angles[0] and angles[1] later
                const RAW_RAY_DISTANCE = this.player.castBlockVisionRay(rayAngleYaw, rayAnglePitch);
                // custom shading
                // render the pixel
                const COLOR = PIXEL_COLORS[RAW_RAY_DISTANCE[1]];
                const brightness = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 0.7);
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