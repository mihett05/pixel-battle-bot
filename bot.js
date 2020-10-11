// ==UserScript==
// @name         PixelBattle2020
// @version      0.1
// @author       mihett05
// @include      https://*.pages-ac.vk-apps.com/*
// @include      https://vk.com/*
// ==/UserScript==
const combine = (func1, func2) => (...args) => {
  func1(...args);
  func2(...args);
};

const decode_colors = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
  g: 16,
  h: 17,
  i: 18,
  j: 19,
  k: 20,
  l: 21,
  m: 22,
  n: 23,
  o: 24,
  p: 25,
};


const Data = {
  MAX_WIDTH: 1590,
  MAX_HEIGHT: 400,
  MAX_COLOR_ID: 25,
  MIN_COLOR_ID: 0,

  SIZE = Data.MAX_WIDTH * Data.MAX_HEIGHT,
  SEND_PIXEL: 0,
  ws: null,

  map: {},
  image: {},

  randomInteger: function (min, max) {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  },
  randomPixel: function () {
    
  }
  chunkString: function (str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  },
  replaceAll: function (string, search, replacement) {
    let target = string;
    return target.split(search).join(replacement);
  },
  pack: function (colorId, flag, x, y) {
    const b = parseInt(colorId, 10) + parseInt(flag, 10) * Data.MAX_COLOR_ID;
    return parseInt(x, 10) + parseInt(y, 10) * Data.MAX_WIDTH + Data.SIZE * b;
  },

  unpack: function (b) {
    const c = Math.floor(b / Data.SIZE);
    const d = (b -= c * Data.SIZE) % Data.MAX_WIDTH;
    return {
      x: d,
      y: (b - d) / Data.MAX_WIDTH,
      color: c % Data.MAX_COLOR_ID,
      flag: Math.floor(c / Data.MAX_COLOR_ID),
    };
  },

  sleep: function (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },

  toArrayBuffer: function (buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  },

  chunkString: function (str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  },

  shuffle: function (array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },
  send: function (ws, colorId, flag, x, y, store) {
    const c = new ArrayBuffer(4);
    new Int32Array(c, 0, 1)[0] = Data.pack(colorId, flag, x, y);

    Data.ws.send(c);
    console.log(`Был раскрашен пиксель [${x}, ${y}] (${colorId})`);
  }
};


async function loadMap() {
  Data.map = {};

  const req = await fetch(`https://pixel-dev.w84.vkforms.ru/api/data/${Data.randomInteger(1, 19)}`);
  const startPixels = await req.text();

  let chunkedString = Data.chunkString(startPixels, 1590);
  chunkedString = chunkedString.slice(0, chunkedString.length - 1);

  let y = 0;
  for (const line of chunkedString) {
    let x = 0;
    const lined = line.split('');
    for (const pixel of lined) {
      const color = decode_colors[pixel];
      Data.map[[x, y]] = color;
      x += 1;
    }
    y += 1;
  }
}




function onOpen() {
  console.log('opened', mapData);
}

function onMessage(msg) {
  
}

function onError() {
  
}

function onClose() {
  
}


const oldWs = unsafeWindow.WebSocket;

unsafeWindow.WebSocket = function newWs(url, protocol) {
  console.log(url, url.includes('pixel'));
  if (url.includes('pixel')) {
    const ws = new oldWs(url, protocol);
    console.log(ws);
    Promise.all([loadData(), ])
      .then(() => {
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
      });
    return ws;
  }
};

