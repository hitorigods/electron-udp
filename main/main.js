const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const dgram = require('dgram'); // UDP通信用モジュールを追加

//メニューバー内容
let template = [
	{
		label: 'アプリ',
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
		label: 'ウィンドウ',
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
	//設定ファイル
	const configPath = path.join(__dirname, '../src/config.json');
	const configData = fs.readFileSync(configPath, 'utf-8');
	const config = JSON.parse(configData);

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

	mainWindow.loadFile(path.join(__dirname, '../src', 'index.html'));

	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('config-data', config);
	});
});

app.on('activate', () => {
	// macOSでは、ユーザがドックアイコンをクリックしたとき、
	// そのアプリのウインドウが無かったら再作成するのが一般的です。
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

ipcMain.on('drag-coordinates', (event, coordinates) => {
	// UDP通信処理
	const { serverAddress, serverPort } = require('../src/config.json');

	// UDP通信で座標データを送信
	const client = dgram.createSocket('udp4');
	const message = JSON.stringify(coordinates);

	client.send(message, serverPort, serverAddress, (err) => {
		console.log(`message=${serverAddress}:${serverPort}`, message);

		if (err) {
			console.error('Error sending message:', err);
		}
		client.close();
	});
});
