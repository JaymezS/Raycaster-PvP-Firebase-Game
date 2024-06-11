"use strict";
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
    constructor() {
        this.gameLoop = setInterval(() => {
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
                const CURRENT_RAY_PITCH = (player.pitch - player.fov / 2) + (y / Canvas.HEIGHT) * player.fov;
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
                const brightness = Math.min(GameMap.tileSize / (RAW_RAY_DISTANCE), 1);
                Utilities.drawPixel(x, y, `rgb(
          ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
          ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
          ${Math.floor(this.gameMap.baseTileColor[2] * brightness)}
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
//# sourceMappingURL=Game.js.map