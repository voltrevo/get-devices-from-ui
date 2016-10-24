'use strict';

module.exports = new Promise((resolve) => {
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
