const path = require('path');
const { spawn } = require('child_process');

const electronPath = path.join(__dirname, '../dist/win-unpacked/electron-udp2.exe');

const electronProcess = spawn(electronPath);
// プロセスの出力を監視
electronProcess.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

electronProcess.stderr.on('data', (data) => {
	console.error(`stderr: ${data}`);
});

// プロセスが終了したときの処理
electronProcess.on('close', (code) => {
	console.log(`Child process exited with code ${code}`);
});
