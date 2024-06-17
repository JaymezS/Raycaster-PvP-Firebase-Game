import { UpdatePlayerPositionToFirebaseCommand } from "./Command.js";
import { Game } from "./Game.js";
import { GameMap, PIXEL_COLORS } from "./Map.js";
//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { Utilities } from "./Utilities.js";
import { VectorMath } from "./Vector.js";
import { Bullet } from "./Bullet.js";
class Player {
    static size = 56;
    // note that x and y are center values
    _x = GameMap.tileSize * 1.5;
    _y = GameMap.tileSize * 1.5;
    _z = GameMap.tileSize * 1.9;
    size = Player.size;
    _yaw = 0;
    _pitch = 0;
    _rotationSpeed = Math.PI / 180;
    _fov = Math.PI / 2; // Field of view
    colorCode = Utilities.randInt(0, PIXEL_COLORS.length);
    acceleration = 2;
    maxMovingSpeed = 8;
    id = nanoid(20);
    grounded = false;
    maxPitch = Math.PI / 2;
    velocityVector = [0, 0, 0];
    _directionVector = [1, 0, 0];
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
    get directionVector() {
        return this._directionVector;
    }
    jump() {
        if (this.grounded) {
            this.velocityVector[2] = 12;
        }
    }
    setLocation(location) {
        this._x = location[0];
        this._y = location[1];
        this._z = location[2];
    }
    setDirection(direction) {
        this._pitch = direction[1];
        this._yaw = direction[0];
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
        if (!Game.instance.isPaused) {
            if (Game.instance.controller.sKeyPressed) {
                vectorSum = VectorMath.addVectors(vectorSum, backwardV);
            }
            if (Game.instance.controller.wKeyPressed) {
                vectorSum = VectorMath.addVectors(vectorSum, forwardV);
            }
            if (Game.instance.controller.aKeyPressed) {
                vectorSum = VectorMath.addVectors(vectorSum, leftV);
            }
            if (Game.instance.controller.dKeyPressed) {
                vectorSum = VectorMath.addVectors(vectorSum, rightV);
            }
        }
        return VectorMath.convertVectorToUnitVector(vectorSum);
    }
    modifyVelocityVectorBasedOnIntendedVector() {
        const INTENDED_MOVEMENT_DIRECTION = this.determineIntendedMovementDirectionVectorBasedOnAccelerationDirections();
        if (INTENDED_MOVEMENT_DIRECTION[0] !== 0 || INTENDED_MOVEMENT_DIRECTION[1] !== 0) {
            const INTENDED_ACCELERATION_VECTOR = VectorMath.convertUnitVectorToVector(INTENDED_MOVEMENT_DIRECTION, this.acceleration);
            this.velocityVector[0] += INTENDED_ACCELERATION_VECTOR[0];
            this.velocityVector[1] += INTENDED_ACCELERATION_VECTOR[1];
            // limit horizontal movement speed
            const HORIZONTAL_VECTOR = [this.velocityVector[0], this.velocityVector[1], 0];
            if (VectorMath.getMagnitude(HORIZONTAL_VECTOR) > this.maxMovingSpeed) {
                const CORRECTED_VECTOR = VectorMath.convertUnitVectorToVector(VectorMath.convertVectorToUnitVector(HORIZONTAL_VECTOR), this.maxMovingSpeed);
                this.velocityVector[0] = CORRECTED_VECTOR[0];
                this.velocityVector[1] = CORRECTED_VECTOR[1];
            }
        }
        else if (INTENDED_MOVEMENT_DIRECTION[0] === 0 && INTENDED_MOVEMENT_DIRECTION[1] === 0) {
            // check for deceleration
            // decelerate character
            const DECELERATE_DIRECTION = VectorMath.convertVectorToUnitVector(VectorMath.scalarMultiply(this.velocityVector, -1));
            const INTENDED_DECELERATION_VECTOR = VectorMath.convertUnitVectorToVector(DECELERATE_DIRECTION, this.acceleration);
            if (VectorMath.getMagnitude(INTENDED_DECELERATION_VECTOR) >
                VectorMath.getMagnitude(this.velocityVector)) {
                this.velocityVector[0] = 0;
                this.velocityVector[1] = 0;
            }
            else {
                this.velocityVector[0] += INTENDED_DECELERATION_VECTOR[0];
                this.velocityVector[1] += INTENDED_DECELERATION_VECTOR[1];
            }
        }
    }
    moveX() {
        this._x += this.velocityVector[0];
        if (this.collideWithWall()) {
            this._x -= this.velocityVector[0];
            let distanceToWall = 0;
            if (this.velocityVector[0] > 0) {
                distanceToWall = GameMap.tileSize - (this._x % GameMap.tileSize) - Player.size / 2 - 1;
            }
            else if (this.velocityVector[0] < 0) {
                distanceToWall = -(this._x % GameMap.tileSize - Player.size / 2);
            }
            this._x += distanceToWall;
        }
    }
    moveY() {
        this._y += this.velocityVector[1];
        if (this.collideWithWall()) {
            this._y -= this.velocityVector[1];
            let distanceToWall = 0;
            if (this.velocityVector[1] > 0) {
                distanceToWall = GameMap.tileSize - (this._y % GameMap.tileSize) - Player.size / 2 - 1;
            }
            else if (this.velocityVector[1] < 0) {
                distanceToWall = -(this._y % GameMap.tileSize - Player.size / 2);
            }
            this._y += distanceToWall;
        }
    }
    moveZ() {
        this._z += this.velocityVector[2];
        if (this.collideWithWall()) {
            this._z -= this.velocityVector[2];
            if (this.velocityVector[2] < 0) {
                this.grounded = true;
                this._z -= ((this._z - Player.size) % GameMap.tileSize);
            }
            else {
                this._z -= this.velocityVector[2];
                this.velocityVector[2] = 0;
                this._z += (GameMap.tileSize - (this._z % GameMap.tileSize)) - 1;
                this.grounded = false;
                return;
            }
        }
        else {
            this.grounded = false;
        }
    }
    updatePosition() {
        this._directionVector = VectorMath.convertYawAndPitchToUnitVector([this._yaw, this._pitch]);
        this.modifyVelocityVectorBasedOnIntendedVector();
        this.moveX();
        this.moveY();
        if (Game.instance.controller.spaceKeyPressed && !Game.instance.isPaused) {
            this.jump();
        }
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
    castBlockVisionRayVersion2(yaw, pitch) {
        const MAP_LENGTH_Z = Game.instance.gameMap.map.length * GameMap.tileSize;
        const MAP_LENGTH_Y = Game.instance.gameMap.map[0].length * GameMap.tileSize;
        const MAP_LENGTH_X = Game.instance.gameMap.map[0][0].length * GameMap.tileSize;
        const RAY_VELOCITY = VectorMath.convertYawAndPitchToUnitVector([yaw, pitch]);
        const PLAYER_POSITION = [this._x, this._y, this._z];
        // calculate the closest x, y, z axis collision, skip empty space, take shortest distance
        let XCollisionResults = [10000, 0];
        let YCollisionResults = [10000, 0];
        let ZCollisionResults = [10000, 0];
        let checkXZPlaneCollision = !(RAY_VELOCITY[1] === 0);
        let checkXYPlaneCollision = !(RAY_VELOCITY[2] === 0);
        let checkYZPlaneCollision = !(RAY_VELOCITY[0] === 0);
        // CHECK PLANE XY COLLISION
        if (checkXYPlaneCollision) {
            const NORMAL_VECTOR = [0, 0, 1];
            let distanceToClosestXYPlane;
            let planeZLevelMultiplier = 1;
            if (RAY_VELOCITY[2] > 0) {
                distanceToClosestXYPlane = Math.ceil(GameMap.tileSize - (this._z % GameMap.tileSize)) + 0.1;
                planeZLevelMultiplier = 1;
            }
            else {
                distanceToClosestXYPlane = -Math.ceil(this._z % GameMap.tileSize) - 0.1;
                planeZLevelMultiplier = -1;
            }
            let planeZLevel = this._z + distanceToClosestXYPlane;
            while (true) {
                const POI = VectorMath.linePlaneIntersection(NORMAL_VECTOR, [0, 0, planeZLevel], PLAYER_POSITION, RAY_VELOCITY);
                if (POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
                    POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
                    POI[2] >= 0 && POI[2] < MAP_LENGTH_Z) {
                    if (Game.instance.gameMap.map[Math.floor(POI[2] / GameMap.tileSize)][Math.floor(POI[1] / GameMap.tileSize)][Math.floor(POI[0] / GameMap.tileSize)] === 1) {
                        // ray hit
                        const DISTANCE = VectorMath.getDistance(POI, PLAYER_POSITION);
                        const HIT_X = Math.abs(POI[0] % GameMap.tileSize);
                        const HIT_Y = Math.abs(POI[1] % GameMap.tileSize);
                        // NOTE: (*0.99) and (+- 0.1) in the above is a bandaid solution to prevent overflowing texture bound
                        // Since POI Calculations are precise, sometimes it gets HIT_X = 64 (boundary)
                        // So the wall Texture array access will exceed length
                        const PIXEL_COLOR = GameMap.wallTexture[1][Math.floor(HIT_X / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)];
                        ZCollisionResults = [DISTANCE, PIXEL_COLOR];
                        break;
                    }
                }
                else {
                    break;
                }
                planeZLevel += GameMap.tileSize * planeZLevelMultiplier;
            }
        }
        // CHECK RAY YZ COLLISION
        if (checkYZPlaneCollision) {
            const NORMAL_VECTOR = [1, 0, 0];
            let distanceToClosestYZPlane;
            let planeXLevelMultiplier = 1;
            if (RAY_VELOCITY[0] > 0) {
                distanceToClosestYZPlane = Math.ceil(GameMap.tileSize - (this._x % GameMap.tileSize)) + 0.1;
                planeXLevelMultiplier = 1;
            }
            else {
                distanceToClosestYZPlane = -Math.ceil(this._x % GameMap.tileSize) - 0.1;
                planeXLevelMultiplier = -1;
            }
            let planeXLevel = this._x + distanceToClosestYZPlane;
            while (true) {
                const POI = VectorMath.linePlaneIntersection(NORMAL_VECTOR, [planeXLevel, 0, 0], PLAYER_POSITION, RAY_VELOCITY);
                if (POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
                    POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
                    POI[2] >= 0 && POI[2] < MAP_LENGTH_Z) {
                    if (Game.instance.gameMap.map[Math.floor(POI[2] / GameMap.tileSize)][Math.floor(POI[1] / GameMap.tileSize)][Math.floor(POI[0] / GameMap.tileSize)] === 1) {
                        // ray hit
                        const DISTANCE = VectorMath.getDistance(POI, PLAYER_POSITION);
                        const HIT_Y = Math.abs(POI[1] % GameMap.tileSize);
                        const HIT_Z = Math.abs(GameMap.tileSize - (POI[2] % GameMap.tileSize)) * 0.99;
                        const PIXEL_COLOR = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_Y / GameMap.wallBitSize)];
                        XCollisionResults = [DISTANCE, PIXEL_COLOR];
                        break;
                    }
                }
                else {
                    break;
                }
                planeXLevel += GameMap.tileSize * planeXLevelMultiplier;
            }
        }
        // CHECK PLANE XZ COLLISION
        if (checkXZPlaneCollision) {
            const NORMAL_VECTOR = [0, 1, 0];
            let distanceToClosestXZPlane;
            let planeYLevelMultiplier = 1;
            if (RAY_VELOCITY[1] > 0) {
                distanceToClosestXZPlane = Math.ceil(GameMap.tileSize - (this._y % GameMap.tileSize)) + 0.1;
                planeYLevelMultiplier = 1;
            }
            else {
                distanceToClosestXZPlane = -Math.ceil(this._y % GameMap.tileSize) - 0.1;
                planeYLevelMultiplier = -1;
            }
            let planeYLevel = this._y + distanceToClosestXZPlane;
            while (true) {
                const POI = VectorMath.linePlaneIntersection(NORMAL_VECTOR, [0, planeYLevel, 0], PLAYER_POSITION, RAY_VELOCITY);
                if (POI[0] >= 0 && POI[0] < MAP_LENGTH_X &&
                    POI[1] >= 0 && POI[1] < MAP_LENGTH_Y &&
                    POI[2] >= 0 && POI[2] < MAP_LENGTH_Z) {
                    if (Game.instance.gameMap.map[Math.floor(POI[2] / GameMap.tileSize)][Math.floor(POI[1] / GameMap.tileSize)][Math.floor(POI[0] / GameMap.tileSize)] === 1) {
                        // ray hit
                        const DISTANCE = VectorMath.getDistance(POI, PLAYER_POSITION);
                        const HIT_X = Math.abs(POI[0] % GameMap.tileSize);
                        const HIT_Z = Math.abs(GameMap.tileSize - (POI[2] % GameMap.tileSize)) * 0.99;
                        const PIXEL_COLOR = GameMap.wallTexture[0][Math.floor(HIT_Z / GameMap.wallBitSize)][Math.floor(HIT_X / GameMap.wallBitSize)];
                        YCollisionResults = [DISTANCE, PIXEL_COLOR];
                        break;
                    }
                }
                else {
                    break;
                }
                planeYLevel += GameMap.tileSize * planeYLevelMultiplier;
            }
        }
        let results;
        if (YCollisionResults[0] <= XCollisionResults[0] &&
            YCollisionResults[0] <= ZCollisionResults[0]) {
            results = YCollisionResults;
        }
        else if (XCollisionResults[0] <= YCollisionResults[0] &&
            XCollisionResults[0] <= ZCollisionResults[0]) {
            results = XCollisionResults;
        }
        else {
            results = ZCollisionResults;
        }
        const COLLISION_WITH_PLAYER = this.getShortestRayCollisionToPlayer(RAY_VELOCITY);
        if (COLLISION_WITH_PLAYER[0] < results[0]) {
            results = COLLISION_WITH_PLAYER;
        }
        const COLLISION_WITH_BULLET = this.getShortestRayCollisionToBullet(RAY_VELOCITY);
        if (COLLISION_WITH_BULLET[0] < results[0]) {
            results = COLLISION_WITH_BULLET;
        }
        return results;
    }
    getShortestRayCollisionToBullet(rayVector) {
        let shortestDistance = 1000000;
        const BULLET_POSITIONS = Object.values(Game.instance.allBullets);
        for (let bullet of BULLET_POSITIONS) {
            const bulletMin = [bullet.x - Bullet.size / 2, bullet.y - Bullet.size / 2, bullet.z - Bullet.size / 2];
            const bulletMax = [bullet.x + Bullet.size / 2, bullet.y + Bullet.size / 2, bullet.z + Bullet.size / 2];
            const INTERSECTIONS = VectorMath.findLineCubeIntersections([this._x, this._y, this._z], rayVector, bulletMin, bulletMax);
            if (INTERSECTIONS) {
                for (let point of INTERSECTIONS) {
                    if (VectorMath.isSameDirection(VectorMath.drawVectorFromP1toP2([this._x, this._y, this._z], point), rayVector)) {
                        const DISTANCE = VectorMath.getDistance([this._x, this._y, this._z], point);
                        if (DISTANCE < shortestDistance) {
                            shortestDistance = DISTANCE;
                        }
                    }
                }
            }
        }
        return [shortestDistance, Bullet.color];
    }
    getShortestRayCollisionToPlayer(rayVector) {
        let shortestDistance = 1000000;
        let color = 0;
        const CHARACTERS_POSITIONS = Object.values(Game.instance.otherPlayers);
        for (let char of CHARACTERS_POSITIONS) {
            const charMin = [char.x - Player.size / 2, char.y - Player.size / 2, char.z - Player.size];
            const charMax = [char.x + Player.size / 2, char.y + Player.size / 2, char.z];
            const INTERSECTIONS = VectorMath.findLineCubeIntersections([this._x, this._y, this._z], rayVector, charMin, charMax);
            if (INTERSECTIONS) {
                for (let point of INTERSECTIONS) {
                    if (VectorMath.isSameDirection(VectorMath.drawVectorFromP1toP2([this._x, this._y, this._z], point), rayVector)) {
                        const DISTANCE = VectorMath.getDistance([this._x, this._y, this._z], point);
                        if (DISTANCE < shortestDistance) {
                            shortestDistance = DISTANCE;
                            color = char.color;
                        }
                    }
                }
            }
        }
        return [shortestDistance, color];
    }
}
export { Player };
//# sourceMappingURL=Player.js.map