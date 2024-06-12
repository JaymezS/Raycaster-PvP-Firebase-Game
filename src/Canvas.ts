import { Game } from "./Game.js";

class Canvas {
  private static _instance: Canvas | undefined;

  public static get instance(): Canvas {
    if (Canvas._instance === undefined) {
      Canvas._instance = new Canvas();
    }
    return Canvas._instance
  } 
  

  readonly screen: HTMLCanvasElement = document.getElementById("game-screen") as HTMLCanvasElement;
  private _context: CanvasRenderingContext2D = this.screen.getContext("2d") as CanvasRenderingContext2D;
  public static WIDTH: number = 1024;
  public static HEIGHT: number = 512;

  private constructor() {
    this.screen.width = Canvas.WIDTH;
    this.screen.height = Canvas.HEIGHT;
  }


  public get context(): CanvasRenderingContext2D {
    return this._context;
  }


  public startGame() {
    Game.instance
    Game.instance.start()
  }
}


export {Canvas}