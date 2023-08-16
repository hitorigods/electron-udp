const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	sendCoordinates: (coordinates) => {
		ipcRenderer.send('drag-coordinates', coordinates);
	},
});
