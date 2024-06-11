"use strict";
class Game {
    static _instance;
    player = new Player();
    gameMap = new GameMap();
    controller = new PlayerController(this.player);
    context = Canvas.instance.context;
    gameLoop = undefined;
    FPS = 30;
    timeInterval = 1000 / this.FPS;
    resolution = 8;
    gravitationalAccelerationConstant = 1;
    terminalVelocity = 20;
    maxRenderDistance = 8 * GameMap.tileSize;
    test = false;
    players = [this.player];
    constructor() {
        this.gameLoop = setInterval(() => {
            this.player.updateVerticalMovementDueToGravity();
            this.controller.updatePlayer();
            this.renderForPlayer(this.player);
        }, this.timeInterval);
    }
    clearScreen() {
        this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    }
    renderForPlayer(player) {
        this.clearScreen();
        for (let x = 0; x < Canvas.WIDTH; x += this.resolution) {
            for (let y = 0; y < Canvas.HEIGHT; y += this.resolution) {
                const CURRENT_RAY_YAW = (player.yaw - player.fov / 2) + (x / Canvas.WIDTH) * player.fov;
                const CURRENT_RAY_PITCH = (player.pitch - player.fov / 4) + (y / Canvas.HEIGHT) * player.fov / 2;
                if (this.test) {
                    console.log(CURRENT_RAY_YAW, CURRENT_RAY_PITCH);
                }
                const RAW_RAY_DISTANCE = player.castVisionRay(CURRENT_RAY_YAW, CURRENT_RAY_PITCH);
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
                const brightness = Math.min(Math.pow(GameMap.tileSize / RAW_RAY_DISTANCE[0], 1.5), 0.5);
                Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(COLOR[0] * brightness)},
          ${Math.floor(COLOR[1] * brightness)},
          ${Math.floor(COLOR[2] * brightness)}
          )`);
            }
        }
        this.test = false;
    }
    static get instance() {
        if (Game._instance === undefined) {
            Game._instance = new Game();
        }
        return Game._instance;
    }
}
//# sourceMappingURL=Game.js.map