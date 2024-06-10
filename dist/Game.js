"use strict";
class Game {
    static _instance;
    constructor() {
        console.log("game started");
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        const screenWidth = canvas.width;
        const screenHeight = canvas.height;
        const fov = Math.PI / 2; // Field of view
        const map = [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ];
        const tileSize = 32;
        const player = {
            x: tileSize * 1.5,
            y: tileSize * 1.5,
            angle: 0,
            speed: 3,
        };
        function drawLine(x1, y1, x2, y2, color) {
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }
        function castRay(angle) {
            const rayPos = { x: player.x, y: player.y };
            const rayDir = { x: Math.cos(angle), y: Math.sin(angle) };
            while (true) {
                const mapX = Math.floor(rayPos.x / tileSize);
                const mapY = Math.floor(rayPos.y / tileSize);
                if (map[mapY][mapX] === 1) {
                    return { x: rayPos.x, y: rayPos.y, distance: Math.hypot(rayPos.x - player.x, rayPos.y - player.y) };
                }
                rayPos.x += rayDir.x;
                rayPos.y += rayDir.y;
            }
        }
        function render() {
            context.clearRect(0, 0, screenWidth, screenHeight);
            for (let x = 0; x < screenWidth; x++) {
                const rayAngle = (player.angle - fov / 2) + (x / screenWidth) * fov;
                const ray = castRay(rayAngle);
                const distance = ray.distance * Math.cos(rayAngle - player.angle);
                const lineHeight = (tileSize * screenHeight) / distance;
                const drawStart = -lineHeight / 2 + screenHeight / 2;
                const drawEnd = lineHeight / 2 + screenHeight / 2;
                drawLine(x, drawStart, x, drawEnd, 'gray');
            }
            requestAnimationFrame(render);
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')
                player.angle -= 0.1;
            if (e.key === 'ArrowRight')
                player.angle += 0.1;
            if (e.key === 'ArrowUp') {
                player.x += player.speed * Math.cos(player.angle);
                player.y += player.speed * Math.sin(player.angle);
            }
            if (e.key === 'ArrowDown') {
                player.x -= player.speed * Math.cos(player.angle);
                player.y -= player.speed * Math.sin(player.angle);
            }
        });
        render();
    }
    static get instance() {
        if (Game._instance === undefined) {
            Game._instance = new Game();
        }
        return Game._instance;
    }
}
//# sourceMappingURL=Game.js.map