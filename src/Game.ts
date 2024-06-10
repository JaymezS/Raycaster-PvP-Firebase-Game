class Game {
  private static _instance: Game | undefined;

  private constructor() {
    console.log("game started")
  }

  public static get instance(): Game {
    if (Game._instance === undefined) {
      Game._instance = new Game()
    }
    return Game._instance;
  }
}