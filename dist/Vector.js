class VectorMath {
    static getMagnitude(v) {
        return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
    }
    static convertVectorToUnitVector(v) {
        const MAG = VectorMath.getMagnitude(v);
        if (MAG === 0) {
            return [0, 0, 0];
        }
        return [v[0] / MAG, v[1] / MAG, v[2] / MAG];
    }
    static convertYawAndPitchToUnitVector(angles) {
        const Z_MAGNITUDE = Math.sin(angles[1]);
        const HORIZONTAL_MAGNITUDE = Math.cos(angles[1]);
        const X_MAGNITUDE = Math.cos(angles[0]) * HORIZONTAL_MAGNITUDE;
        const Y_MAGNITUDE = Math.sin(angles[0]) * HORIZONTAL_MAGNITUDE;
        return [X_MAGNITUDE, Y_MAGNITUDE, Z_MAGNITUDE];
    }
    static convertVectorToYawAndPitch(v) {
        let yaw;
        let pitch;
        const HORIZONTAL_MAGNITUDE = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
        pitch = Math.atan(v[2] / HORIZONTAL_MAGNITUDE);
        if (v[1] >= 0) {
            if (v[0] >= 0) {
                yaw = Math.atan(v[1] / v[0]);
            }
            else {
                yaw = Math.PI - Math.atan(v[1] / Math.abs(v[0]));
            }
        }
        else {
            if (v[0] >= 0) {
                yaw = -(Math.atan(Math.abs(v[1]) / v[0]));
            }
            else {
                yaw = -(Math.PI - Math.atan(Math.abs(v[1]) / Math.abs(v[0])));
            }
        }
        return [yaw, pitch];
    }
    static addVectors(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
    }
    static convertUnitVectorToVector(uv, magnitude) {
        return [uv[0] * magnitude, uv[1] * magnitude, uv[2] * magnitude];
    }
    static scalarMultiply(v, s) {
        return [v[0] * s, v[1] * s, v[2] * s];
    }
    static isSameDirection(v1, v2) {
        const v1UV = VectorMath.convertVectorToUnitVector(v1);
        const v2UV = VectorMath.convertVectorToUnitVector(v2);
        const DP = VectorMath.dotProduct(v1UV, v2UV);
        return Math.abs(DP - 1) < 1e-10;
    }
    static drawVectorFromP1toP2(p1, p2) {
        return [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    }
    static subtractVector(v1, v2) {
        return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
    }
    static getDistance(p1, p2) {
        return VectorMath.getMagnitude([p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]);
    }
    static dotProduct(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    // ChatGPT code for finding intersection between line and plane
    // Adjusted to use my code
    static linePlaneIntersection(planeNormal, planePoint, linePoint, lineDirection) {
        const d = VectorMath.subtractVector(linePoint, planePoint);
        const nDotD = VectorMath.dotProduct(planeNormal, d);
        const nDotB = VectorMath.dotProduct(planeNormal, lineDirection);
        // Check if the line is parallel to the plane
        if (nDotB === 0) {
            if (nDotD === 0) {
                // The line lies in the plane
                return null; // Returning null to indicate no unique intersection
            }
            else {
                // The line is parallel and distinct from the plane
                return null;
            }
        }
        // Calculate the scalar parameter t
        const t = -nDotD / nDotB;
        // Calculate the intersection point
        const intersectionPoint = VectorMath.addVectors(linePoint, VectorMath.scalarMultiply(lineDirection, t));
        return intersectionPoint;
    }
    // CHATGPT code that complements findLineCubeIntersections
    static isPointInsideCube(point, cubeMin, cubeMax) {
        return (point[0] >= cubeMin[0] && point[0] <= cubeMax[0]) &&
            (point[1] >= cubeMin[1] && point[1] <= cubeMax[1]) &&
            (point[2] >= cubeMin[2] && point[2] <= cubeMax[2]);
    }
    static findLineCubeIntersections(linePoint, lineDirection, cubeMin, cubeMax) {
        const normals = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];
        const points = [
            [cubeMax[0], cubeMin[1], cubeMin[2]], [cubeMin[0], cubeMin[1], cubeMin[2]],
            [cubeMin[0], cubeMax[1], cubeMin[2]], [cubeMin[0], cubeMin[1], cubeMin[2]],
            [cubeMin[0], cubeMin[1], cubeMax[2]], [cubeMin[0], cubeMin[1], cubeMin[2]]
        ];
        let intersectionsResults = [];
        for (let i = 0; i < normals.length; i++) {
            const intersection = VectorMath.linePlaneIntersection(normals[i], points[i], linePoint, lineDirection);
            if (intersection && VectorMath.isPointInsideCube(intersection, cubeMin, cubeMax)) {
                intersectionsResults.push(intersection);
            }
        }
        if (intersectionsResults.length === 0) {
            return null;
        }
        else {
            return intersectionsResults;
        }
    }
}
export { VectorMath };
//# sourceMappingURL=Vector.js.map