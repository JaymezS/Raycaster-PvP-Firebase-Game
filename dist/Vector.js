class VectorMath {
    static convertVectorToUnitVector(x, y, z) {
        const MAGNITUDE = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        return [x / MAGNITUDE, y / MAGNITUDE, z / MAGNITUDE];
    }
    static convertYawAndPitchToUnitVector(yaw, pitch) {
        const Z_MAGNITUDE = Math.sin(pitch);
        const HORIZONTAL_MAGNITUDE = Math.cos(pitch);
        const X_MAGNITUDE = Math.cos(yaw) * HORIZONTAL_MAGNITUDE;
        const Y_MAGNITUDE = Math.sin(yaw) * HORIZONTAL_MAGNITUDE;
        return [X_MAGNITUDE, Y_MAGNITUDE, Z_MAGNITUDE];
    }
}
export { VectorMath };
//# sourceMappingURL=Vector.js.map