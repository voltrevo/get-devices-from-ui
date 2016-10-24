'use strict';

const EventEmitter = require('events');

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

const getOpentok = () => {
  if (window.OT) {
    return Promise.resolve(window.OT);
  }

  return loadScript('https://static.opentok.com/v2/js/opentok.js')
    .then(() => window.OT)
  ;
};

const DeviceItem = (ot, device) => {
  const deviceItem = {};

  deviceItem.device = device;

  deviceItem.display = DeviceDisplay();
  deviceItem.display.querySelector('.pub-label').textContent = device.label;
  deviceItem.pubContainer = deviceItem.display.querySelector('.pub-container');

  const opt = (device.kind === 'audioInput' ?
    { audioSource: device.deviceId, videoSource: null } :
    { audioSource: null, videoSource: device.deviceId }
  );

  opt.insertMode = 'append';

  deviceItem.publisher = ot.initPublisher(deviceItem.pubContainer, opt);

  deviceItem.events = new EventEmitter();

  deviceItem.display.addEventListener('click', () => {
    deviceItem.events.emit('click');
  });

  return deviceItem;
};

const DeviceSelectorGroup = (ot, devices, container) => {
  const group = {};

  group.selectedDeviceId = null;

  group.items = devices.map(device => DeviceItem(ot, device));

  const deselectAll = () => {
    group.items.forEach((item) => {
      item.pubContainer.classList.remove('selected');
    });
  };

  group.items.forEach((item) => {
    container.appendChild(item.display);

    item.events.addListener('click', () => {
      deselectAll();

      if (group.selectedDeviceId !== item.device.deviceId) {
        item.pubContainer.classList.add('selected');
        group.selectedDeviceId = item.device.deviceId;
      } else {
        item.pubContainer.classList.remove('selected');
        group.selectedDeviceId = null;
      }
    });
  });

  if (group.items.length > 0) {
    group.items[0].pubContainer.classList.add('selected');
    group.selectedDeviceId = group.items[0].device.deviceId;
  }

  return group;
};

const getDevicesFromUI = () => new Promise((resolve) => {
  getOpentok().then((ot) => {
    ot.getDevices((err, devices) => {
      if (err) {
        throw err;
      }

      const deviceSelector = DeviceSelector();
      document.body.appendChild(deviceSelector);

      const videoGroup = DeviceSelectorGroup(
        ot,
        devices.filter(device => device.kind === 'videoInput'),
        deviceSelector.querySelector('.video-options')
      );

      const audioGroup = DeviceSelectorGroup(
        ot,
        devices.filter(device => device.kind === 'audioInput'),
        deviceSelector.querySelector('.audio-options')
      );

      const okButton = deviceSelector.querySelector('.ok-button');
      const cancelButton = deviceSelector.querySelector('.cancel-button');

      const cleanup = () => {
        [videoGroup, audioGroup].forEach((group) => {
          group.items.forEach((item) => {
            item.publisher.destroy();
          });
        });

        document.body.removeChild(deviceSelector);
      };

      okButton.addEventListener('click', () => {
        cleanup();

        resolve({
          videoSource: videoGroup.selectedDeviceId,
          audioSource: audioGroup.selectedDeviceId,
        });
      });

      cancelButton.addEventListener('click', () => {
        cleanup();
        resolve({ video: null, audio: null });
      });
    });
  });
});

window.getDevicesFromUI = getDevicesFromUI;
