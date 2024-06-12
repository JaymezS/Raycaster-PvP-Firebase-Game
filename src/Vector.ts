class VectorMath {
  public static convertVectorToUnitVector(x: number, y: number, z: number): number[] {
    const MAGNITUDE: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2))
    return [x / MAGNITUDE, y / MAGNITUDE, z / MAGNITUDE];
  }


  public static convertYawAndPitchToUnitVector(yaw: number, pitch: number): number[] {
    const Z_MAGNITUDE: number = Math.sin(pitch);
    const HORIZONTAL_MAGNITUDE: number = Math.cos(pitch);
    const X_MAGNITUDE: number = Math.cos(yaw) * HORIZONTAL_MAGNITUDE
    const Y_MAGNITUDE: number = Math.sin(yaw) * HORIZONTAL_MAGNITUDE
    return [X_MAGNITUDE, Y_MAGNITUDE, Z_MAGNITUDE]
  }
}


export {VectorMath}