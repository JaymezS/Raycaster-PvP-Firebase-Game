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
}