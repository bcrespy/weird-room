
import Creenv from "@creenv/core";

import HUD from "@creenv/hud";
import GUI from "@creenv/gui";
import Stats from "@creenv/stats";

import config from "./config";
import controls from "./user-controls";

import AudioManager from "@creenv/audio/manager";
import Capture from "@creenv/capture";

import Renderer from "./renderer";


class MyProject extends Creenv {
  constructor () {
    super();
    this.audio = new AudioManager(AudioManager.SOURCE_TYPE.FILE, {
      filepath: "tim-tama-ephemeral-obscr030.mp3",
      analyser: {
        peakDetection: {
          options: {
            threshold: 1.3
          }
        }
      }
    }, true);
  }

  init() {
    super.init();  

    super.framerate(60);

    //this.stats = new Stats();
    this.guiControls = new GUI(controls, GUI.POSITION.TOP_RIGHT);
    this.hud = new HUD();
    //this.hud.add(this.stats);
    this.hud.add(this.guiControls);

    this.renderer = new Renderer();
    this.renderer.init();

    return new Promise(resolve => {
      this.audio.init().then(resolve);
    });
  }

  render() {
    //this.stats.begin();

    this.renderer.render(this.deltaT, this.elapsedTime, this.audio.getAnalysedAudioData(this.deltaT, this.elapsedTime));

    //this.stats.end();
  }
}

let project = new MyProject();
//project.bootstrap(); 

let capture = new Capture(project, {
  framerate: 30,
  export: {
    type: "jpeg-sequence",
    framerate: 30,
    filename: "sequence.zip"
  },
  audio: {
    manager: project.audio
  }
});