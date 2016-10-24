'use strict';

const DeviceDisplay = require('./DeviceDisplay.html');
const DeviceSelector = require('./DeviceSelector.html');
require('./style.css');

const documentReady = new Promise((resolve) => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    const onReady = () => {
      resolve();
      document.removeEventListener('DOMContentLoaded', onReady, true);
      window.removeEventListener('load', onReady, true);
    };
    document.addEventListener('DOMContentLoaded', onReady, true);
    window.addEventListener('load', onReady, true);
  }
});

const loadScript = src => documentReady.then(() => {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);

  return new Promise(resolve =>
    script.addEventListener('load', resolve)
  );
});

loadScript('https://static.opentok.com/v2/js/opentok.js').then(() => {
  const ot = window.OT;

  ot.getDevices((err, devices) => {
    if (err) {
      throw err;
    }

    const deviceSelector = DeviceSelector();
    document.body.appendChild(deviceSelector);

    const audioContainers = [];
    const videoContainers = [];

    const publishers = devices.map((device) => {
      const mediaTypeContainer = deviceSelector.querySelector(
        device.kind === 'audioInput' ?
        '.audio-options' :
        '.video-options'
      );

      const deviceDisplay = DeviceDisplay();
      mediaTypeContainer.appendChild(deviceDisplay);

      const pubContainer = deviceDisplay.querySelector('.pub-container');

      const containerGroup = (device.kind === 'audioInput' ?
        audioContainers :
        videoContainers
      );

      containerGroup.push(pubContainer);

      pubContainer.addEventListener('click', () => {
        containerGroup.forEach((sibling) => {
          sibling.classList.remove('selected');
        });

        pubContainer.classList.add('selected');
      });

      const opt = (device.kind === 'audioInput' ?
        { audioSource: device.deviceId, videoSource: null } :
        { audioSource: null, videoSource: device.deviceId }
      );

      opt.insertMode = 'append';

      deviceDisplay.querySelector('.pub-label').textContent = device.label;

      return ot.initPublisher(pubContainer, opt);
    });

    [audioContainers, videoContainers].forEach((containerGroup) => {
      if (containerGroup.length > 0) {
        containerGroup[0].classList.add('selected');
      }
    });
  });
});
