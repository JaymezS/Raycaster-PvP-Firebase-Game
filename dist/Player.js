import { UpdatePlayerPositionToFirebaseCommand } from "./Command.js";
import { Game } from "./Game.js";
import { GameMap, Colors, PIXEL_COLORS } from "./Map.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Utilities } from "./Utilities.js";
import { VectorMath } from "./Vector.js";
class Player {
    static size = 56;
    // note that x and y are center values
    _x = GameMap.tileSize * 1.5;
    _y = GameMap.tileSize * 1.5;
    _z = GameMap.tileSize * 2;
    size = Player.size;
    _yaw = 0;
    _pitch = 0;
    _rotationSpeed = Math.PI / 180;
    _fov = Math.PI / 2; // Field of view
    colorCode = Utilities.randInt(0, PIXEL_COLORS.length);
    acceleration = 1;
    maxMovingSpeed = 8;
    isAcceleratingLeft = false;
    isAcceleratingRight = false;
    isAcceleratingForward = false;
    isAcceleratingBackward = false;
    id = nanoid(20);
    grounded = false;
    maxPitch = Math.PI / 2;
    velocityVector = [0, 0, 0];
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get z() {
        return this._z;
    }
    get yaw() {
        return this._yaw;
    }
    get pitch() {
        return this._pitch;
    }
    get fov() {
        return this._fov;
    }
    get rotationSpeed() {
        return this._rotationSpeed;
    }
    set yaw(angle) {
        this._yaw = angle;
    }
    set pitch(angle) {
        this._pitch = angle;
    }
    jump() {
        if (this.grounded) {
            this.velocityVector[2] = 12;
        }
    }
    rotateYaw(deg) {
        this._yaw += deg;
    }
    rotatePitch(deg) {
        if (this._pitch + deg <= this.maxPitch &&
            this._pitch + deg >= -this.maxPitch) {
            this._pitch += deg;
        }
    }
    determineIntendedMovementDirectionVectorBasedOnAccelerationDirections() {
        const forwardV = VectorMath.convertYawAndPitchToUnitVector([this.yaw, 0]);
        const backwardV = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI, 0]);
        const leftV = VectorMath.convertYawAndPitchToUnitVector([this.yaw - Math.PI / 2, 0]);
        const rightV = VectorMath.convertYawAndPitchToUnitVector([this.yaw + Math.PI / 2, 0]);
        let vectorSum = [0, 0, 0];
        if (this.isAcceleratingBackward) {
            vectorSum = VectorMath.addVectors(vectorSum, backwardV);
        }
        if (this.isAcceleratingForward) {
            vectorSum = VectorMath.addVectors(vectorSum, forwardV);
        }
        if (this.isAcceleratingLeft) {
            vectorSum = VectorMath.addVectors(vectorSum, leftV);
        }
        if (this.isAcceleratingRight) {
            vectorSum = VectorMath.addVectors(vectorSum, rightV);
        }
        return VectorMath.convertVectorToUnitVector(vectorSum);
    }
    modifyVelocityVectorBasedOnIntendedVector() {
        const INTENDED_MOVEMENT_DIRECTION = this.determineIntendedMovementDirectionVectorBasedOnAccelerationDirections();
        if (INTENDED_MOVEMENT_DIRECTION[0] !== 0 || INTENDED_MOVEMENT_DIRECTION[1] !== 0) {
            const INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE = VectorMath.convertUnitVectorToVector(INTENDED_MOVEMENT_DIRECTION, this.acceleration);
            this.velocityVector[0] += INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE[0];
            this.velocityVector[1] += INTENDED_MOVEMENT_DIRECTION_WITH_MAGNITUDE[1];
            // limit horizontal movement speed
            const HV_VECTOR = [this.velocityVector[0], this.velocityVector[1], 0];
            if (VectorMath.getMagnitude(HV_VECTOR) > this.maxMovingSpeed) {
                const CORRECTED_VECTOR = VectorMath.convertUnitVectorToVector(VectorMath.convertVectorToUnitVector(HV_VECTOR), this.maxMovingSpeed);
                this.velocityVector[0] = CORRECTED_VECTOR[0];
                this.velocityVector[1] = CORRECTED_VECTOR[1];
            }
        }
        else if (INTENDED_MOVEMENT_DIRECTION[0] === 0 && INTENDED_MOVEMENT_DIRECTION[1] === 0) {
            // check for deceleration
            // decelerate character
            const DECELERATE_DIRECTION = VectorMath.scalarMultiply(this.velocityVector, -1);
            const INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE = VectorMath.convertUnitVectorToVector(DECELERATE_DIRECTION, this.acceleration);
            this.velocityVector[0] += INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE[0];
            this.velocityVector[1] += INTENDED_DECELERATION_DIRECTION_WITH_MAGNITUDE[1];
        }
    }
    moveX() {
        this._x += this.velocityVector[0];
        if (this.collideWithWall()) {
            this._x -= this.velocityVector[0];
        }
    }
    moveY() {
        this._y += this.velocityVector[1];
        if (this.collideWithWall()) {
            this._y -= this.velocityVector[1];
        }
    }
    moveZ() {
        this._z += this.velocityVector[2];
        if (this.collideWithWall()) {
            if (this.velocityVector[2] < 0) {
                this.grounded = true;
            }
            else {
                this._z -= this.velocityVector[2];
                this.velocityVector[2] = 0;
                return;
            }
            this._z -= this.velocityVector[2];
        }
        else {
            this.grounded = false;
        }
        new UpdatePlayerPositionToFirebaseCommand(this).execute();
    }
    updatePosition() {
        this.modifyVelocityVectorBasedOnIntendedVector();
        this.moveX();
        this.moveY();
        this.updateVerticalMovementDueToGravity();
        new UpdatePlayerPositionToFirebaseCommand(this).execute();
    }
    updateVerticalMovementDueToGravity() {
        if (!this.grounded) {
            if (this.velocityVector[2] <= -Game.instance.terminalVelocity) {
                this.velocityVector[2] = -Game.instance.terminalVelocity;
            }
            else {
                this.velocityVector[2] -= Game.instance.gravitationalAccelerationConstant;
            }
        }
        else if (this.velocityVector[2] < 0) {
            this.velocityVector[2] = 0;
        }
        this.moveZ();
    }
    pointInWall(x, y, z) {
        if (Game.instance.gameMap.map[Math.floor(z / GameMap.tileSize)][Math.floor(y / GameMap.tileSize)][Math.floor(x / GameMap.tileSize)] !== 0) {
            return true;
        }
        return false;
    }
    pointInCharacterAtLocation(px, py, pz, cx, cy, cz) {
        if (px >= cx - Player.size / 2 &&
            px <= cx + Player.size / 2 &&
            py >= cy - Player.size / 2 &&
            py <= cy + Player.size / 2 &&
            pz <= cz &&
            pz >= cz - Player.size) {
            return true;
        }
        return false;
    }
    collideWithWall() {
        const VERTICES = [
            [this._x + this.size / 2, this._y - this.size / 2, this._z],
            [this._x + this.size / 2, this._y + this.size / 2, this._z],
            [this._x - this.size / 2, this._y + this.size / 2, this._z],
            [this._x - this.size / 2, this._y - this.size / 2, this._z],
            [this._x + this.size / 2, this._y - this.size / 2, this._z - this.size],
            [this._x + this.size / 2, this._y + this.size / 2, this._z - this.size],
            [this._x - this.size / 2, this._y - this.size / 2, this._z - this.size],
            [this._x - this.size / 2, this._y + this.size / 2, this._z - this.size],
        ];
        for (let vertex of VERTICES) {
            if (this.pointInWall(vertex[0], vertex[1], vertex[2])) {
                return true;
            }
        }
        return false;
    }
    castBlockVisionRay2(yaw, pitch) {
        let currentRayPositionX = this._x;
        let currentRayPositionY = this._y;
        let currentRayPositionZ = this._z;
        const RAY_VELOCITY_X = Math.cos(pitch) * Math.cos(yaw);
        const RAY_VELOCITY_Y = Math.cos(pitch) * Math.sin(yaw);
        const RAY_VELOCITY_Z = Math.sin(pitch);
        // calculate collsion in x direction
        const Y_OFFSET = GameMap.tileSize;
        // 8:40: optimized algorithm to skip empty blocks
        // https://www.youtube.com/watch?v=gYRrGTC7GtA&t=3s
        return [];
    }
    castBlockVisionRay(yaw, pitch) {
        // cheap way to increase performance by increasing the ray cast speed, it does reduce accuracy of render tho
        // 4-5 is the limit, any higher and graphics will be completely innaccurate
        // remove this method later, try  to use castBlockVisionRay2 if possible
        // higher # = more innaccurate graphics
        const RAY_SPEED = 5;
        let currentRayPositionX = this._x;
        let currentRayPositionY = this._y;
        let currentRayPositionZ = this._z;
        const RAY_VELOCITY_X = RAY_SPEED * Math.cos(pitch) * Math.cos(yaw);
        const RAY_VELOCITY_Y = RAY_SPEED * Math.cos(pitch) * Math.sin(yaw);
        const RAY_VELOCITY_Z = RAY_SPEED * Math.sin(pitch);
        const CHARACTERS_POSITIONS = Object.values(Game.instance.otherPlayers);
        while (true) {
            let rayhitCharacter = false;
            let hitColor = undefined;
            for (let char of CHARACTERS_POSITIONS) {
                if (this.pointInCharacterAtLocation(currentRayPositionX, currentRayPositionY, currentRayPositionZ, char.x, char.y, char.z)) {
                    rayhitCharacter = true;
                    hitColor = char.color;
                }
            }
            // if the ray collided into a wall, return the distance the ray has travelled and the x position of the wall hit (from the left)
            if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(currentRayPositionY / GameMap.tileSize)][Math.floor(currentRayPositionX / GameMap.tileSize)] === 1) {
                let pixelColorCode;
                const RETRACED_X = currentRayPositionX - RAY_VELOCITY_X;
                const RETRACED_Y = currentRayPositionY - RAY_VELOCITY_Y;
                if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(currentRayPositionY / GameMap.tileSize)][Math.floor(RETRACED_X / GameMap.tileSize)] === 0) {
                    // the change in x is what made it it, calculate the position hit based on the y and z
                    const HIT_Y = currentRayPositionY % GameMap.tileSize;
                    const HIT_Z = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize);
                    pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)];
                }
                else if (Game.instance.gameMap.map[Math.floor(currentRayPositionZ / GameMap.tileSize)][Math.floor(RETRACED_Y / GameMap.tileSize)][Math.floor(currentRayPositionX / GameMap.tileSize)] === 0) {
                    // the change in y is what made it it, calculate the position hit based on the x and z
                    const HIT_X = currentRayPositionX % GameMap.tileSize;
                    const HIT_Z = GameMap.tileSize - (currentRayPositionZ % GameMap.tileSize);
                    pixelColorCode = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_X / GameMap.wallBitSize)];
                }
                else {
                    // the change in y is what made it it, calculate the position hit based on the x and z
                    const HIT_X = currentRayPositionX % GameMap.tileSize;
                    const HIT_Y = currentRayPositionY % GameMap.tileSize;
                    pixelColorCode = GameMap.wallTexture[1][Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)];
                }
                return [
                    Math.sqrt(Math.pow(currentRayPositionX - this._x, 2) +
                        Math.pow(currentRayPositionY - this._y, 2) +
                        Math.pow(currentRayPositionZ - this._z, 2)),
                    pixelColorCode
                ];
            }
            else if (rayhitCharacter) {
                return [
                    Math.sqrt(Math.pow(currentRayPositionX - this._x, 2) +
                        Math.pow(currentRayPositionY - this._y, 2) +
                        Math.pow(currentRayPositionZ - this._z, 2)),
                    hitColor
                ];
            }
            else if (Math.sqrt(Math.pow(currentRayPositionX - this._x, 2) +
                Math.pow(currentRayPositionY - this._y, 2) +
                Math.pow(currentRayPositionZ - this._z, 2)) > Game.instance.maxRenderDistance) {
                return [Math.sqrt(Math.pow(currentRayPositionX - this._x, 2) +
                        Math.pow(currentRayPositionY - this._y, 2) +
                        Math.pow(currentRayPositionZ - this._z, 2)), Colors.GRAY];
            }
            // move the ray 1 unit in the unit vector's direction
            currentRayPositionX += RAY_VELOCITY_X;
            currentRayPositionY += RAY_VELOCITY_Y;
            currentRayPositionZ += RAY_VELOCITY_Z;
        }
    }
}
export { Player };
//# sourceMappingURL=Player.js.map