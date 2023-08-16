const draggable = document.getElementById('draggable');

draggable.addEventListener('mousedown', (e) => {
	e.preventDefault();
	const offsetX = e.clientX - draggable.getBoundingClientRect().left;
	const offsetY = e.clientY - draggable.getBoundingClientRect().top;
	document.addEventListener('mousemove', onDrag);
	document.addEventListener('mouseup', stopDrag);
});

function onDrag(e) {
	const x = e.clientX;
	const y = e.clientY;
	draggable.style.left = `${x}px`;
	draggable.style.top = `${y}px`;

	// api 経由で sendCoordinates を呼び出す
	window.api.sendCoordinates({ x, y });
}

function stopDrag() {
	document.removeEventListener('mousemove', onDrag);
	document.removeEventListener('mouseup', stopDrag);
}
