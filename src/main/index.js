const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const dgram = require('dgram');

/** メニューバー内容 */
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
	/** 設定ファイル */
	const configPath =
		process.env.NODE_ENV === 'development'
			? path.join(__dirname, '../renderer/config.json')
			: path.join(process.resourcesPath, './app/config.json');
	const configData = fs.readFileSync(configPath, 'utf-8');
	const config = JSON.parse(configData);

	/** メニューバー設置 */
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	/** ウィンドウ設定 */
	mainWindow = new BrowserWindow({
		width: 1400,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.loadFile(
		process.env.NODE_ENV === 'development'
			? path.join(__dirname, '../renderer/index.html')
			: path.join(process.resourcesPath, './app/index.html')
	);

	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('config-data', config);
	});
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

ipcMain.on('drag-coordinates', (event, coordinates) => {
	/** UDP通信処理 */
	const { serverAddress, serverPort } = require(process.env.NODE_ENV === 'development'
		? path.join(__dirname, '../renderer/config.json')
		: path.join(process.resourcesPath, './app/config.json'));

	/** 座標データを送信 */
	const client = dgram.createSocket('udp4');
	const message = JSON.stringify(coordinates);

	client.send(message, 0, message.length, serverPort, serverAddress, (err) => {
		console.log(message, 0, message.length, serverPort, serverAddress);

		if (err) {
			console.error('Error sending message:', err);
		}
		client.close();
	});
});
