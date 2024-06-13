class VectorMath {

  public static getMagnitude(v: number[]): number {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2))
  }


  public static convertVectorToUnitVector(v: number[]): number[] {
    const MAG: number = VectorMath.getMagnitude(v)
    if (MAG === 0) {
      return [0, 0, 0]
    }
    return [v[0] / MAG, v[1] / MAG, v[2] / MAG];
  }


  public static convertYawAndPitchToUnitVector(angles: number[]): number[] {
    const Z_MAGNITUDE: number = Math.sin(angles[1]);
    const HORIZONTAL_MAGNITUDE: number = Math.cos(angles[1]);
    const X_MAGNITUDE: number = Math.cos(angles[0]) * HORIZONTAL_MAGNITUDE
    const Y_MAGNITUDE: number = Math.sin(angles[0]) * HORIZONTAL_MAGNITUDE
    return [X_MAGNITUDE, Y_MAGNITUDE, Z_MAGNITUDE]
  }

  public static convertVectorToYawAndPitch(v: number[]): number[] {
    let yaw: number;
    let pitch: number;
    const HORIZONTAL_MAGNITUDE: number = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2))
    pitch = Math.atan(v[2] / HORIZONTAL_MAGNITUDE)
    
    if (v[1] >= 0) {
      if (v[0] >= 0) {
        yaw = Math.atan(v[1] / v[0])
      } else {
        yaw = Math.PI - Math.atan(v[1] / Math.abs(v[0]))
      }
    } else {
      if (v[0] >= 0) {
        yaw = -(Math.atan(Math.abs(v[1]) / v[0]))
      } else {
        yaw = -(Math.PI - Math.atan(Math.abs(v[1]) / Math.abs(v[0])))
      }
    }
    return [yaw, pitch];
  }

  public static addVectors(v1: number[], v2: number[]) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
  }

  public static convertUnitVectorToVector(uv: number[], magnitude: number): number[] {
    return [uv[0] * magnitude, uv[1] * magnitude, uv[2] * magnitude]
  }

  public static scalarMultiply(v: number[], s: number): number[] {
    return [v[0] * s, v[1] * s, v[2] * s]
  }
}


export {VectorMath}