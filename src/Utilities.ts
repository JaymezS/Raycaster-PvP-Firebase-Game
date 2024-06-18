import { Canvas } from "./Canvas.js";
import { Game } from "./Game.js";

class Utilities {
  public static drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    const CONTEXT: CanvasRenderingContext2D = Canvas.instance.context;
    CONTEXT.strokeStyle = color;
    CONTEXT.beginPath();
    CONTEXT.moveTo(x1, y1);
    CONTEXT.lineTo(x2, y2);
    CONTEXT.stroke();
    CONTEXT.closePath();
  }

  public static drawPixel(x: number, y: number, color: string) {
    Canvas.instance.context.fillStyle = color;
    Canvas.instance.context.fillRect(x, y, Game.instance.resolution, Game.instance.resolution);
  }


  // lower bound inclusive, upper exclusive
  public static randInt(low: number, high: number) {
    return Math.floor(Math.random() * (high-low)) + low
  }


  // public static calculateAngleFromLeftOfCone(
  //   totalAngle: number, totalLength: number, distanceFromLeft: number
  // ): number {
  //   const OPPOSITE: number = totalLength / 2
  //   const HEIGHT: number = (OPPOSITE) / (Math.tan(totalAngle / 2))
  //   const ANGLE_FROM_CENTER: number = Math.atan(Math.abs(OPPOSITE - distanceFromLeft) / HEIGHT)
    
  //   if (distanceFromLeft <= OPPOSITE) {
  //     return (totalAngle / 2) - ANGLE_FROM_CENTER;
  //   } else {
  //     return (totalAngle / 2) + ANGLE_FROM_CENTER
  //   }
  // }

  public static fillShapeOnVertices(vertices: number[][], color: string) {
    if (vertices.length >= 2) {
      let shape: Path2D = new Path2D()
      shape.moveTo(vertices[0][0], vertices[0][1])
      for (let i = 1; i < vertices.length; i++) {
        shape.lineTo(vertices[i][0], vertices[i][1])
      }
      shape.closePath()
      Canvas.instance.context.fillStyle = color;
      Canvas.instance.context.fill(shape)
    }
  }


  // modified code from StackOverflow to autowrap texts in canvas
  public static writeLargeText(
    text: string, x: number, y: number, maxWidth: number, fontSize: number = 16, fontFace: string = "Arial"
  ) {
    var words = text.split(' ');
    var line = '';
    var lineHeight=fontSize;
    Canvas.instance.context.fillStyle = "black"
    Canvas.instance.context.font = fontSize + "px " + fontFace;
  
    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = Canvas.instance.context.measureText(testLine);
      var testWidth = metrics.width;
      if(testWidth > maxWidth) {
        Canvas.instance.context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    Canvas.instance.context.fillText(line, x, y);
  }
}


export {Utilities}
