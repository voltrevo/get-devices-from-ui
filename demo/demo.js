'use strict';

const getDevicesFromUI = require('../index.js');

const App = require('./App.html');
const PubWithDestroy = require('./PubWithDestroy.html');

const documentReady = require('../documentReady.js');
const getOpentok = require('../getOpentok.js');

documentReady.then(() => {
  const app = App();
  document.body.appendChild(app);

  app.querySelector('.publish-button').addEventListener('click', () => {
    Promise
      .all([
        getDevicesFromUI(),
        getOpentok(),
      ])
      .then(([devices, ot]) => {
        if (devices.audioSource === null && devices.videoSource === null) {
          return;
        }

        const pubWithDestroy = PubWithDestroy();

        app.appendChild(pubWithDestroy);

        const pub = ot.initPublisher(
          pubWithDestroy.querySelector('.pub-container'),
          {
            videoSource: devices.videoSource,
            audioSource: devices.audioSource,
          }
        );

        pubWithDestroy.querySelector('.destroy-button').addEventListener('click', () => {
          pub.destroy();
          app.removeChild(pubWithDestroy);
        });
      })
    ;
  });
});
