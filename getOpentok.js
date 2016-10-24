'use strict';

const documentReady = require('./documentReady.js');
const once = require('lodash/once');

const loadScript = src => documentReady.then(() => {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);

  return new Promise(resolve =>
    script.addEventListener('load', resolve)
  );
});

module.exports = once(() => {
  if (window.OT) {
    return Promise.resolve(window.OT);
  }

  return loadScript('https://static.opentok.com/v2/js/opentok.js')
    .then(() => window.OT)
  ;
});
