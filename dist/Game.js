import { PlayerController } from "./PlayerController.js";
import { Canvas } from "./Canvas.js";
import { DisplayMenuAndSetMouseControllerCommand, DisplayTextCommand, ExitGameThenDisplayMenuCommand, LockPointerCommand, RemoveAllBulletsBySelfFromDatabaseCommand, RemoveBulletFromFirebaseByIDCommand, RemoveClientPlayerFromDatabaseCommand, RemoveOwnLaserFromFirebaseCommand, RenderViewForPlayerCommand, StartGameCommand, TogglePauseCommand, UnlockPointerCommand, UpdateBulletPositionToFirebaseCommand } from "./Command.js";
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
import { Bullet } from "./Bullet.js";
import { Rectangle } from "./Shapes.js";
import { Laser } from "./Laser.js";
class Game {
    static _instance;
    player = new Player();
    gameMap = new GameMap();
    controller = new PlayerController(this.player);
    context = Canvas.instance.context;
    gameLoop = undefined;
    FPS = 30;
    timeInterval = 1000 / this.FPS;
    resolution = 10;
    gravitationalAccelerationConstant = 1;
    terminalVelocity = 12;
    maxRenderDistance = 8 * GameMap.tileSize;
    pauseMenuBrightnessMultiplier = 0.1;
    defaultBrightnessMultiplier = 0.9;
    brightnessMultiplier = this.defaultBrightnessMultiplier;
    spawnLocation = [GameMap.tileSize * 1.5, GameMap.tileSize * 1.5, GameMap.tileSize * 1.9];
    spawnDirection = [0, 0];
    isPaused = true;
    _mainMenu = new CompositeMenu("JamesCraft Shooter");
    pauseMenu = new CompositeMenu("Game Paused");
    _gameOverMenu = new CompositeMenu("Game Over");
    bulletsBySelf = [];
    bulletsToRemove = [];
    otherPlayers = {};
    allBullets = {};
    otherLasers = {};
    healthBar = new Rectangle(Canvas.WIDTH / 2 - 300, Canvas.HEIGHT - 80, "Black", 600, 60);
    get mainMenu() {
        return this._mainMenu;
    }
    get gameOverMenu() {
        return this._gameOverMenu;
    }
    constructor() {
        this.composeMainMenu();
        this.composePauseMenu();
        this.composeGameOverMenu();
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
        onValue(ref(FirebaseClient.instance.db, "/lasers"), (snapshot) => {
            if (snapshot.val()) {
                this.otherLasers = snapshot.val();
                //Remove the player's laser
                if (this.player.laser != undefined) {
                    delete this.otherLasers[this.player.laser.id];
                }
            }
        }, { onlyOnce: true });
        onValue(ref(FirebaseClient.instance.db, "/bullets"), (snapshot) => {
            if (snapshot.val()) {
                this.allBullets = snapshot.val();
            }
        }, { onlyOnce: true });
    }
    updateOwnBulletsAndUpdateToFirebase() {
        for (let i = 0; i < this.bulletsBySelf.length; i++) {
            const bullet = this.bulletsBySelf[i];
            bullet.updatePosition();
            new UpdateBulletPositionToFirebaseCommand(bullet).execute();
            if (bullet.collideWithWall()) {
                this.bulletsBySelf.splice(i, 1);
                this.bulletsToRemove.push(bullet);
            }
        }
        for (let i = 0; i < this.bulletsToRemove.length; i++) {
            const B = this.bulletsToRemove[i];
            if (this.allBullets[B.id]) {
                new RemoveBulletFromFirebaseByIDCommand(B.id).execute();
                this.bulletsToRemove.splice(i, 1);
            }
        }
        // delete ghost bullets (that do not exist in db)
    }
    startGame() {
        this.player.setLocation(this.spawnLocation);
        this.player.setDirection(this.spawnDirection);
        this.player.resetHealth();
        this.player.laser.isOn = false;
        this.controller.assignPointerLockChangeCommand(new TogglePauseCommand());
        this.gameLoop = setInterval(() => {
            const TIME = performance.now();
            this.updateFromDatabase();
            this.player.update();
            this.updateOwnBulletsAndUpdateToFirebase();
            this.checkPlayerCollisionWithBullets();
            this.checkPlayerCollisionWithLasers();
            this.renderForPlayer();
            this.renderPlayerUI();
            if (this.player.health <= 0) {
                this.controller.assignPointerLockChangeCommand(undefined);
                new UnlockPointerCommand().execute();
                new ExitGameThenDisplayMenuCommand(this.gameOverMenu).execute();
                return;
            }
            if (this.isPaused) {
                new DisplayMenuAndSetMouseControllerCommand(this.pauseMenu).execute();
            }
            // displays FPS
            this.context.font = "24px Arial";
            this.context.fillStyle = "white";
            this.context.fillText(`MAX FPS: ${Math.round(1000 / (performance.now() - TIME))}`, 50, 50);
        }, this.timeInterval);
    }
    composeMainMenu() {
        const START_BUTTON = new MenuButton(Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2, Canvas.HEIGHT / 2 - MenuButton.buttonHeight / 2, "Start Game");
        START_BUTTON.addCommand(new StartGameCommand());
        const INSTRUCTION_PARAGRAPH = `Welcome to my 3D PvP shooter Game, the goal of the game is to eliminate other players, click "Start Game" to begin, left click in game to toggle a hit-scan laser that does minimum damage, right click to shoot a slow projectile that does heavy damage.`;
        const UI_EXPLAINATION_PARAGRAPH = "The red bar at the bottom is the health bar, when it reaches 0, it is Game Over. The bar on the right is your ammunition bar, lasers will consistently drain ammo when on, and bullets will cost a chunk of ammo when shooting. New lasers and bullets cannot be used when the ammo is below a certain threshold. Ammo will regenerate slower if used below that threshold (tip: try to keep ammo above the threshold, shoot in bursts)";
        const INSTRUCTION_COMMAND = new DisplayTextCommand(INSTRUCTION_PARAGRAPH, Canvas.WIDTH / 4, Canvas.HEIGHT / 2, 300);
        const UI_COMMAND = new DisplayTextCommand(UI_EXPLAINATION_PARAGRAPH, Canvas.WIDTH / 4 * 3 - 300, Canvas.HEIGHT / 2, 300);
        this._mainMenu.
            addMenuButton(START_BUTTON).
            addDisplayElementCommand(INSTRUCTION_COMMAND).
            addDisplayElementCommand(UI_COMMAND);
    }
    composePauseMenu() {
        const RESUME_BUTTON = new MenuButton(Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2, Canvas.HEIGHT / 2 - MenuButton.buttonHeight * 2, "Resume Game");
        RESUME_BUTTON.addCommand(new LockPointerCommand());
        const EXIT_BUTTON = new MenuButton(Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2, Canvas.HEIGHT / 2 + MenuButton.buttonHeight, "Exit Game");
        EXIT_BUTTON.addCommand(new ExitGameThenDisplayMenuCommand(this.mainMenu));
        this.pauseMenu.addMenuButton(RESUME_BUTTON);
        this.pauseMenu.addMenuButton(EXIT_BUTTON);
        this.pauseMenu.assignRenderBackgroundCommand(new RenderViewForPlayerCommand());
    }
    composeGameOverMenu() {
        const MENU_BUTTON = new MenuButton(Canvas.WIDTH / 2 - MenuButton.buttonWidth / 2, Canvas.HEIGHT / 2 - MenuButton.buttonHeight / 2, "Return To Menu");
        MENU_BUTTON.addCommand(new DisplayMenuAndSetMouseControllerCommand(this.mainMenu));
        this.gameOverMenu.addMenuButton(MENU_BUTTON);
        this.gameOverMenu.assignRenderBackgroundCommand(new RenderViewForPlayerCommand());
    }
    endGame() {
        this.isPaused = true;
        this.controller.assignEscKeyPressedCommand(undefined);
        this.brightnessMultiplier = Game.instance.pauseMenuBrightnessMultiplier;
        this.player.laser.isOn = false;
        this.controller.clearInput();
        clearInterval(this.gameLoop);
        new RemoveClientPlayerFromDatabaseCommand().execute();
        new RemoveAllBulletsBySelfFromDatabaseCommand().execute();
        new RemoveOwnLaserFromFirebaseCommand().execute();
        this.player.determineIntendedMovementDirectionVectorBasedOnAccelerationDirections();
    }
    checkPlayerCollisionWithBullets() {
        const BULLET_POSITIONS = Object.values(this.allBullets);
        for (let bullet of BULLET_POSITIONS) {
            const bmin = [bullet.x - Bullet.size / 2, bullet.y - Bullet.size / 2, bullet.z - Bullet.size / 2];
            const bmax = [bullet.x + Bullet.size / 2, bullet.y + Bullet.size / 2, bullet.z + Bullet.size / 2];
            if (VectorMath.rectanglesCollide(bmin, bmax, this.player.charMin, this.player.charMax) &&
                bullet.sourcePlayerID !== this.player.id) {
                this.player.takeDamage(Bullet.damage);
                new RemoveBulletFromFirebaseByIDCommand(bullet.id).execute();
            }
        }
    }
    checkPlayerCollisionWithLasers() {
        const LASERS = Object.values(this.otherLasers);
        const MAP_LENGTH_Z = Game.instance.gameMap.map.length * GameMap.tileSize;
        const MAP_LENGTH_Y = Game.instance.gameMap.map[0].length * GameMap.tileSize;
        const MAP_LENGTH_X = Game.instance.gameMap.map[0][0].length * GameMap.tileSize;
        for (let laser of LASERS) {
            if (laser.isOn) {
                let currentPosition = [laser.position[0], laser.position[1], laser.position[2]];
                while (true) {
                    if (VectorMath.isPointInCube(currentPosition, this.player.charMin, this.player.charMax)) {
                        this.player.takeDamage(Laser.damage);
                        break;
                    }
                    if (currentPosition[0] >= 0 && currentPosition[0] < MAP_LENGTH_X &&
                        currentPosition[1] >= 0 && currentPosition[1] < MAP_LENGTH_Y &&
                        currentPosition[2] >= 0 && currentPosition[2] < MAP_LENGTH_Z) {
                        if (Game.instance.gameMap.map[Math.floor(currentPosition[2] / GameMap.tileSize)][Math.floor(currentPosition[1] / GameMap.tileSize)][Math.floor(currentPosition[0] / GameMap.tileSize)] === 1) {
                            break;
                        }
                    }
                    currentPosition[0] += laser.direction[0];
                    currentPosition[1] += laser.direction[1];
                    currentPosition[2] += laser.direction[2];
                }
            }
        }
    }
    clearScreen() {
        this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    }
    renderPlayerUI() {
        // Draw crosshair
        if (this.player.laser.isOn) {
            Utilities.drawLine(Canvas.WIDTH / 2 - 20, Canvas.HEIGHT / 2, Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 - 20, Canvas.HEIGHT / 2 + 1, Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2 + 1, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 - 20, Canvas.HEIGHT / 2 - 1, Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2 - 1, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 + 20, Canvas.HEIGHT / 2, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 + 20, Canvas.HEIGHT / 2 + 1, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2 + 1, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 + 20, Canvas.HEIGHT / 2 - 1, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2 - 1, "red");
            Utilities.drawLine(Canvas.WIDTH / 2, Canvas.HEIGHT / 2 - 20, Canvas.WIDTH / 2, Canvas.HEIGHT / 2 - 10, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 - 20, Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 - 10, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 - 20, Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 - 10, "red");
            Utilities.drawLine(Canvas.WIDTH / 2, Canvas.HEIGHT / 2 + 20, Canvas.WIDTH / 2, Canvas.HEIGHT / 2 + 10, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 + 20, Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 + 10, "red");
            Utilities.drawLine(Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 + 20, Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 + 10, "red");
            // Draw laser shooting effect 
            Utilities.fillShapeOnVertices([
                [Canvas.WIDTH / 4 * 3 + 50, Canvas.HEIGHT],
                [Canvas.WIDTH / 4 * 3 - 50, Canvas.HEIGHT],
                [Canvas.WIDTH / 2, Canvas.HEIGHT / 2],
            ], "white");
        }
        else {
            Utilities.drawLine(Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2, "white");
            Utilities.drawLine(Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2 + 1, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2 + 1, "white");
            Utilities.drawLine(Canvas.WIDTH / 2 - 10, Canvas.HEIGHT / 2 - 1, Canvas.WIDTH / 2 + 10, Canvas.HEIGHT / 2 - 1, "white");
            Utilities.drawLine(Canvas.WIDTH / 2, Canvas.HEIGHT / 2 - 10, Canvas.WIDTH / 2, Canvas.HEIGHT / 2 + 10, "white");
            Utilities.drawLine(Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 - 10, Canvas.WIDTH / 2 + 1, Canvas.HEIGHT / 2 + 10, "white");
            Utilities.drawLine(Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 - 10, Canvas.WIDTH / 2 - 1, Canvas.HEIGHT / 2 + 10, "white");
        }
        // Draw Health Bar
        Canvas.instance.context.fillStyle = "red";
        Canvas.instance.context.font = "24px Arial";
        Canvas.instance.context.fillText("Health", Canvas.WIDTH / 2 - 400, Canvas.HEIGHT - 50);
        this.healthBar.draw();
        Canvas.instance.context.fillStyle = "red";
        Canvas.instance.context.fillRect((Canvas.WIDTH / 2) - 290, Canvas.HEIGHT - 70, (this.player.health / this.player.maxHealth) * 580, 40);
        // Draw Gauge Bar
        Canvas.instance.context.fillStyle = "yellow";
        Canvas.instance.context.fillText("Ammo", Canvas.WIDTH - 80, Canvas.HEIGHT / 2 - 40);
        Canvas.instance.context.fillText("Gauge", Canvas.WIDTH - 80, Canvas.HEIGHT / 2 - 18);
        Canvas.instance.context.fillStyle = "black";
        Canvas.instance.context.fillRect(Canvas.WIDTH - 80, Canvas.HEIGHT / 2, 60, Canvas.HEIGHT / 2 - 20);
        if (this.player.ammoGauge.canUse) {
            Canvas.instance.context.fillStyle = "yellow";
        }
        else {
            Canvas.instance.context.fillStyle = "gray";
        }
        const GAUGE_HEIGHT = (Canvas.HEIGHT / 2 - 60) * (this.player.ammoGauge.gauge / this.player.ammoGauge.maxGauge);
        const MAX_GAUGE_HEIGHT = Canvas.HEIGHT / 2 - 60;
        Canvas.instance.context.fillRect(Canvas.WIDTH - 70, Canvas.HEIGHT / 2 + 20 + MAX_GAUGE_HEIGHT - GAUGE_HEIGHT, 40, GAUGE_HEIGHT);
    }
    renderForPlayer() {
        this.clearScreen();
        const ADJACENT_LENGTH_MAGNITUDE = (Canvas.WIDTH / 2) / Math.tan(this.player.fov / 2);
        const PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR = VectorMath.convertYawAndPitchToUnitVector([this.player.yaw, this.player.pitch]);
        const PLAYER_TO_VIEWPORT_CENTER_VECTOR = VectorMath.convertUnitVectorToVector(PLAYER_TO_VIEWPORT_CENTER_UNIT_VECTOR, ADJACENT_LENGTH_MAGNITUDE);
        // 1 unit vector from the left of the view port to the right
        const PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR = VectorMath.convertYawAndPitchToUnitVector([this.player.yaw + Math.PI / 2, 0]);
        // 1 unit vector from the top of the viewport to the bottom
        let PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR;
        if (this.player.pitch >= 0) {
            PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
                VectorMath.convertYawAndPitchToUnitVector([this.player.yaw, this.player.pitch - Math.PI / 2]);
        }
        else {
            PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR =
                VectorMath.convertYawAndPitchToUnitVector([Math.PI + this.player.yaw, -(Math.PI / 2 + this.player.pitch)]);
        }
        // bruh opposite direction != -1 * yaw, was stuck for 2 hours
        let playerToViewportTopLeftVector = VectorMath.addVectors(PLAYER_TO_VIEWPORT_CENTER_VECTOR, VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, -Canvas.WIDTH / 2));
        playerToViewportTopLeftVector = VectorMath.addVectors(playerToViewportTopLeftVector, VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, -Canvas.HEIGHT / 2));
        for (let x = 0; x < Canvas.WIDTH; x += this.resolution) {
            // default ray cast
            // const CURRENT_RAY_YAW = (this.player.yaw - this.player.fov / 2) +
            //   (x / Canvas.WIDTH) * this.player.fov;
            // attempted fix to gradient
            // let rayAngleYaw: number = Utilities.calculateAngleFromLeftOfCone(
            //   this.player.fov, Canvas.WIDTH, x
            // )
            // problem lies in this line, should not add, but use a formula to combine the two
            // ie imagine the player is looking up, the player's viewport is a plane not paralle to any axial planes
            // therefore, when viewed from above, the player's viewport's vertices have different yaws
            // 
            // fix: since player's angle can be expressed as a vector, do that, then for every pixel, express it as a vector from the center of the viewport plane, then perform vector addition, and convert the resultant back to yaw and pitch
            // note that conversion must first be done to incoporate Canvas size as a part of the viewport plane.
            // with this fix, x and y would not be seperate, each pair of x and y will generate a unique resultant vector, and thereby a unique pitch and yaw
            // rayAngleYaw += (this.player.yaw - this.player.fov / 2)
            for (let y = 0; y < Canvas.HEIGHT; y += this.resolution) {
                // old ray pitch
                // const CURRENT_RAY_PITCH = (this.player.pitch + VERTICAL_FOV / 2) -
                //   (y / Canvas.HEIGHT) * VERTICAL_FOV
                // attempted fix to gradient
                // Note that this does nothing right now
                // let rayAnglePitch: number = Utilities.calculateAngleFromLeftOfCone(
                //   VERTICAL_FOV, Canvas.HEIGHT, y
                // )
                // rayAnglePitch = (this.player.pitch + VERTICAL_FOV / 2) - rayAnglePitch
                let viewportTopLeftToPointVector = VectorMath.addVectors(VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_HORIZONTAL_UNIT_VECTOR, x), VectorMath.convertUnitVectorToVector(PLAYER_VIEWPORT_VERTICAL_UNIT_VECTOR, y));
                let vectorFromPlayerToPoint = VectorMath.addVectors(playerToViewportTopLeftVector, viewportTopLeftToPointVector);
                let rayAngles = VectorMath.convertVectorToYawAndPitch(vectorFromPlayerToPoint);
                const RAW_RAY_DISTANCE = this.player.castBlockVisionRayVersion3(rayAngles[0], rayAngles[1]);
                // custom shading
                // render the pixel
                const COLOR = PIXEL_COLORS[RAW_RAY_DISTANCE[1]];
                const brightness = Math.min((GameMap.tileSize / RAW_RAY_DISTANCE[0]), 1) * this.brightnessMultiplier;
                Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(COLOR[0] * brightness)},
          ${Math.floor(COLOR[1] * brightness)},
          ${Math.floor(COLOR[2] * brightness)}
          )`);
            }
        }
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