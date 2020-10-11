// ==UserScript==
// @name         PixelBattle2020
// @version      0.1
// @author       mihett05
// @include      https://*.pages-ac.vk-apps.com/*
// @include      https://vk.com/*
// ==/UserScript==
const oldWs = unsafeWindow.WebSocket;

const combine = (func1, func2) => (...args) => {
  func1(...args);
  func2(...args);
};


function onOpen() {
  console.log('opened');
}

function onMessage(msg) {
  
}

function onError() {
  
}

function onClose() {
  
}

unsafeWindow.WebSocket = function newWs(url, protocol) {
  console.log(url, url.includes('pixel'));
  if (url.includes('pixel')) {
    const ws = new oldWs(url, protocol);
    console.log(ws);

    setTimeout(() => {
      const oldOnOpen = ws.onopen;
      const oldOnMessage = ws.onmessage;
      const oldOnError = ws.onerror;
      const oldOnClose = ws.onclose;

      ws.onopen = combine(oldOnOpen, onOpen);
      if (ws.readyState !== 0) {
        onOpen();
      }

      ws.onmessage = combine(oldOnMessage, onMessage);
      ws.onerror = combine(oldOnError, onError);
      ws.onclose = combine(oldOnClose, onClose);

      console.log(ws);
    }, 200);
    return ws;
  }
};

