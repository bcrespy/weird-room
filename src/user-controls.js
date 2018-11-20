
import config from './config';

let userControls = {

  object: config,

  controls: [

    [
      "distortion",

      {
        property: "distortionMin", 
        min: 0, max: 10.0, step: 0.05
      },

      {
        property: "distortionRange", 
        min: 0, max: 10.0, step: 0.05
      },
    ],

    { 
      property: "scale", 
      min: 0, max: 10.0, step: 0.1
    }
  ]

};


export default userControls;