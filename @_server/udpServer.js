const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
	console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
	// 受信した座標データを処理するなど
});

server.bind(12345); // 受信ポート番号を適宜変更
