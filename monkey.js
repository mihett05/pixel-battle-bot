// ==UserScript==
// @name     PixelBattle2020
// @version  0.1
// @author   mihett05
// @include  https://vk.com/*
// ==/UserScript==

const head = document.querySelector('head');
head.innerHTML = `
<script src="https://raw.githubusercontent.com/mihett05/pixel-battle-bot/master/image.js"></script>
<script src="https://raw.githubusercontent.com/mihett05/pixel-battle-bot/master/bot.js"></script>
` + head.innerHTML;
