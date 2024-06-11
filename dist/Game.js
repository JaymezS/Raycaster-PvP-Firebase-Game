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
    constructor() {
        this.gameLoop = setInterval(() => {
            this.controller.updatePlayer();
            this.render();
        }, this.timeInterval);
    }
    clearScreen() {
        this.context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
    }
    render() {
        this.clearScreen();
        for (let x = 0; x < Canvas.WIDTH; x++) {
            const rayAngle = (this.player.angle - this.player.fov / 2) + (x / Canvas.WIDTH) * this.player.fov;
            const ray = this.castRay(rayAngle);
            const distance = ray.distance * Math.cos(rayAngle - this.player.angle);
            const lineHeight = (GameMap.tileSize * Canvas.HEIGHT) / distance;
            const drawStart = -lineHeight / 2 + Canvas.HEIGHT / 2;
            const drawEnd = lineHeight / 2 + Canvas.HEIGHT / 2;
            // custom shading
            const brightness = Math.min(GameMap.tileSize / distance, 1);
            this.drawLine(x, drawStart, x, drawEnd, `rgb(
        ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
        ${Math.floor(this.gameMap.baseTileColor[2] * brightness)}
        )`);
            /**
             *         `rgb(
              ${Math.floor(this.gameMap.baseTileColor[0] * brightness)},
              ${Math.floor(this.gameMap.baseTileColor[1] * brightness)},
              ${Math.floor(this.gameMap.baseTileColor[2] * brightness)},
              )`
             */
        }
    }
    castRay(angle) {
        const rayPos = { x: this.player.x, y: this.player.y };
        const rayDir = { x: Math.cos(angle), y: Math.sin(angle) };
        while (true) {
            const mapX = Math.floor(rayPos.x / GameMap.tileSize);
            const mapY = Math.floor(rayPos.y / GameMap.tileSize);
            if (this.gameMap.map[mapY][mapX] === 1) {
                return { x: rayPos.x, y: rayPos.y, distance: Math.hypot(rayPos.x - this.player.x, rayPos.y - this.player.y) };
            }
            rayPos.x += rayDir.x;
            rayPos.y += rayDir.y;
        }
    }
    drawLine(x1, y1, x2, y2, color) {
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
    static get instance() {
        if (Game._instance === undefined) {
            Game._instance = new Game();
        }
        return Game._instance;
    }
}
//# sourceMappingURL=Game.js.map