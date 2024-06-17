import { Canvas } from "./Canvas.js";

class MouseLockClient {
  readonly requestMouseLock: Function | undefined;
  readonly exitMouseLock: Function | undefined;
  constructor() {
    const havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;
    
    if (havePointerLock) {
      this.requestMouseLock = Canvas.instance.screen.requestPointerLock ||
        //@ts-ignorets-ignore
        Canvas.instance.screen.mozRequestPointerLock ||
        //@ts-ignorets-ignore
        Canvas.instance.screen.webkitRequestPointerLock;
      
      this.exitMouseLock = document.exitPointerLock ||
        //@ts-ignorets-ignore
        document.mozExitPointerLock ||
        //@ts-ignorets-ignore
        document.webkitExitPointerLock;
    }
  }
}

export {MouseLockClient}