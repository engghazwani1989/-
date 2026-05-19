function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);
// Open browser console and run:
console.log(typeof loadInitialDataWithCloud); // Should be 'function'
console.log(typeof syncNowWithCloud); // Should be 'function'
