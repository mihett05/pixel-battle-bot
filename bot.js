console.log(_rustbot_image_data);
const oldWs = window.WebSocket;

window.WebSocket = function newWs(url, protocol) {
	if (url.includes('pixel')) {
    window.pixelBattleWs = new oldWs(url, protocol);
    return window.pixelBattleWs;
	}
};