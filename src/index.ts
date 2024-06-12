import {Canvas} from "./Canvas.js"

class Driver {
  constructor() {
    Canvas.instance
    Canvas.instance.startGame()
  }
}


new Driver()
//@ts-ignorets-ignore
window.Driver = Driver