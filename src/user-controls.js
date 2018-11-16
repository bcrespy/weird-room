
import config from './config';

let userControls = {

  object: config,

  controls: [

    [
      "i am a folder",

      {
        property: "translation", 
        min: -150, max: 150, step: 20
      },

      {
        property: "backgroundColor"
      }
    ],

    {
      property: "drawText"
    },

    {
      property: "text"
    }

      ]

};


export default userControls;