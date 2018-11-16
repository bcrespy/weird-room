
import Canvas from "@creenv/canvas";
import Vector2 from "@creenv/vector/vector2";
import Color from "@creenv/color";

import config from "./config";


const BOUNCING_HEIGHT = 150,
      CUBE_SIZE = new Vector2(250, 250);

class Renderer {
  init () {
    this.canvas = new Canvas();
    this.cubeColor = new Color(255,0,255);
  }

  render (deltaT, time) {
    this.canvas.fillStyle(this.cubeColor.string);

    this.canvas.background(config.backgroundColor.string);

    let translationY = Math.abs(Math.cos(time/1000)) * BOUNCING_HEIGHT;
    this.canvas.rect(this.canvas.width/2-CUBE_SIZE.x/2 + config.translation, this.canvas.height/2-CUBE_SIZE.y/2-translationY, CUBE_SIZE.x, CUBE_SIZE.y);

    if (config.drawText) {
      this.canvas.context.font = "27px Arial";
      this.canvas.context.fillText(config.text, this.canvas.width/2-CUBE_SIZE.x/2 + config.translation, this.canvas.height/2-CUBE_SIZE.y/2-translationY)
    }
  }
}

export default Renderer;