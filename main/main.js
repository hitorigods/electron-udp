const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const dgram = require('dgram'); // UDP通信用モジュールを追加

//メニューバー内容
let template = [
	{
		label: 'Your-App',
		submenu: [
			{
				label: 'アプリを終了',
				accelerator: 'Cmd+Q',
				click: function () {
					app.quit();
				},
			},
		],
	},
	{
		label: 'Window',
		submenu: [
			{
				label: '最小化',
				accelerator: 'Cmd+M',
				click: function () {
					mainWindow.minimize();
				},
			},
			{
				label: '最大化',
				accelerator: 'Cmd+Ctrl+F',
				click: function () {
					mainWindow.maximize();
				},
			},
			{
				type: 'separator',
			},
			{
				label: 'リロード',
				accelerator: 'Cmd+R',
				click: function () {
					BrowserWindow.getFocusedWindow().reload();
				},
			},
		],
	},
];

let mainWindow;

app.on('ready', () => {
	//メニューバー設置
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	mainWindow = new BrowserWindow({
		width: 1400, // ウィンドウ幅を1400に設定
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// 開発モードでウィンドウを開く
	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools(); // DevToolsを自動で開く
	}

	mainWindow.loadFile(path.join(__dirname, '../renderer', 'index.html'));
});

app.on('activate', () => {
	// macOSでは、ユーザがドックアイコンをクリックしたとき、
	// そのアプリのウインドウが無かったら再作成するのが一般的です。
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

ipcMain.on('drag-coordinates', (event, coordinates) => {
	console.log('Received drag coordinates:', coordinates);

	// UDP通信で座標データを送信
	const client = dgram.createSocket('udp4');
	const message = JSON.stringify(coordinates);
	const serverPort = 12345; // 送信先ポート番号を適宜変更
	const serverAddress = '192.168.1.2'; // 送信先のIPアドレスを適宜変更
	client.send(message, serverPort, serverAddress, (err) => {
		if (err) {
			console.error('Error sending message:', err);
		}
		client.close();
	});
});
