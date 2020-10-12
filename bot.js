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

const MAX_WIDTH = 1590;
const MAX_HEIGHT = 400;

const Data = {
  MAX_COLOR_ID: 25,
  MIN_COLOR_ID: 0,

  SIZE: MAX_WIDTH * MAX_HEIGHT,
  SEND_PIXEL: 0,

  ws: null,
  startWait: 0,
  startWaitGot: false,

  map: {},
  image: {},
  start: {},

  randomInteger: function (min, max) {
    const rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  },
  randomPixel: function () {
    
  },
  chunkString: function (str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  },
  replaceAll: function (string, search, replacement) {
    let target = string;
    return target.split(search).join(replacement);
  },
  pack: function (colorId, flag, x, y) {
    const b = parseInt(colorId, 10) + parseInt(flag, 10) * Data.MAX_COLOR_ID;
    return parseInt(x, 10) + parseInt(y, 10) * MAX_WIDTH + Data.SIZE * b;
  },

  unpack: function (b) {
    const c = Math.floor(b / Data.SIZE);
    const d = (b -= c * Data.SIZE) % MAX_WIDTH;
    return {
      x: d,
      y: (b - d) / MAX_WIDTH,
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
  parseEvent: function (event) {
    if (typeof event === 'string') return;

    const c = Data.toArrayBuffer(event.data);

    for (let d = c.byteLength / 4, e = new Int32Array(c, 0, d), f = Math.floor(d / 3), g = 0; g < f; g++) {
      const h = e[3 * g],
        k = Data.unpack(h),
        l = k.x,
        m = k.y,
        n = k.color;
      console.log(k);
      Data.map[[l, m]] = n;
    }
  },
  send: function (colorId, flag, x, y) {
    if (Data.map[[x, y]] !== colorId) {
      const c = new ArrayBuffer(4);
      new Int32Array(c, 0, 1)[0] = Data.pack(colorId, flag, x, y);

      if (Data.ws !== null) {
        Data.ws.send(c);
        Data.map[[x, y]] = colorId;
        console.log(`Был раскрашен пиксель [${x}, ${y}] (${colorId})`);
        return true;
      }
      
    }
    return false;
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


async function loadImage() {
  const req = await fetch(`https://raw.githubusercontent.com/mihett05/pixel-battle-bot/master/image.json?time=${(new Date()).getTime()}`);
  const data = await req.json();
  Data.start = data.start;
  Data.image = data.img;
}


function pixelHandler() {
  for (let y = 0; y < Data.image.length; y++) {
    for (let x = 0; x < Data.image[y].length; x++) {
      const color = Data.image[y][x];
      const mapCoord = {
        x: x + Data.start.x,
        y: y + Data.start.y
      };
      
      if (Data.map[[mapCoord.x, mapCoord.y]] !== color) {
        console.log('found', mapCoord, Data.map[[mapCoord.x, mapCoord.y]], color);
        Data.send(color, Data.SEND_PIXEL, mapCoord.x, mapCoord.y);
        return;
      }
    }
  }
}


async function onOpen() {
  if (Data.startWaitGot) {
    console.log('opened wait', Data.startWait);
    await Data.sleep(Data.startWait);
    console.log('waited start');
    while (true) {
      console.log('iter');
      pixelHandler();
      console.log('sleep');
      setTimeout(() => {
      	loadMap();
      }, 30000);
      await Data.sleep(60200);
    }
  } else {
    setTimeout(() => {
      onOpen();
    }, 60200);
  }
  
}

function earlyOnMessage(msg) {
  if (typeof msg.data === 'string') {
    try {
      const data = JSON.parse(msg.data);
      if (data.t === 12 && data.v[0] && data.v[0].v.wait !== undefined) {
        Data.startWait = data.v[0].v.wait;
        Data.startWaitGot = true;
      }
      console.log(data);
    } catch (e) {}
  }
}

function onMessage(msg) {
  if (typeof msg.data === 'string') {
    try {
      const data = JSON.parse(msg.data);
      console.log(data);
    } catch (e) {
      console.log(msg.data);
    }
  } else {
    Data.parseEvent(msg);
  }
}

function onError(err) {
  console.log('err', err);
}

function onClose(event) {
  console.log('close', event);
  Data.ws = null;
  window.location.reload();
}

const oldWs = unsafeWindow.WebSocket;

unsafeWindow.WebSocket = function newWs(url, protocol) {
  console.log(url, url.includes('pixel'));
  if (url.includes('pixel')) {
    if (Data.ws !== null) {
      if (Data.ws.readyState !== 3) {
        Data.ws.close();
      }
      Data.ws = null;
    }
    const ws = new oldWs(url, protocol);
    
    Data.ws = ws;
    console.log(ws);

    
    let oldOnMessage = null;
    const messageCallbacks = [];
    

    setTimeout(() => {
      oldOnMessage = ws.onmessage;
      ws.onmessage = combine(earlyOnMessage, oldOnMessage);
    }, 40);

    Promise.all([loadMap(), loadImage()])
      .then(() => {
        const oldOnOpen = ws.onopen;
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

