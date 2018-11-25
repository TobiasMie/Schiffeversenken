// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show some notification and exit
if (!window.WebSocket) {
	content.html($('<p>',
		{ text:'Sorry, but your browser doesn\'t support WebSocket.'}
	));
}

// open connection
var connection = new WebSocket('ws://127.0.0.1:1337');

// catching errors with the connection
connection.onerror = function (error) {
	alert('Sorry, but there\'s some problem with your connection or the server is down.');
};

// onopen() is executed once the connection is established
connection.onopen = function () {
	console.log('Connected to the Server');
};

// This event is trigert everytime a message is send from the server
connection.onmessage = function (message){
	// trying to decode the JSON
	try {
		var json = JSON.parse(message.data);
	} catch (e) {
		console.log('Invalid JSON: ', message.data);
		return;
	}

	DataManager.receiveData(json);
}
