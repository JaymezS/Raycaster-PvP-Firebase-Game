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
}
export { VectorMath };
//# sourceMappingURL=Vector.js.map