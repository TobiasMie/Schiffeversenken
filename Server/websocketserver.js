#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
// Speichert die Verbindungen
var clients = [];
// Speichert die gameTokens
var games = [];
// Speichert die Verbindungen der Spiele
var gameClients = [];

var server = http.createServer(function(request, response) {
	// process HTTP request. Since we're writing just WebSockets
	// server we don't have to implement anything.
});
server.listen(1337, function() {
	console.log((new Date()) + " Server is listening on port 1337");
});
// create the server
wsServer = new WebSocketServer({
	httpServer: server
});


// WebSocket server
wsServer.on('request', function(request) {
	var gameToken = null;
	console.log((new Date()) + ' Connection from origin '+ request.origin + '.');

	var connection = request.accept(null, request.origin);
	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;
	console.log("Connected with id: "+index);

	// message handler
	connection.on('message', function(message) {
		//trying to decode the JSON
		try {
			var json = JSON.parse(message.utf8Data);
		} catch (e) {
			console.log('Invalid JSON: ', message.utf8Data);
			return;
		}
		console.log(json);
		if(json.type == "createGame"){
			console.log(json.type);
			gameToken = randomTokenNotInArray();
			games.push(gameToken);
			let gameIndex = games.indexOf(gameToken);
			gameClients[gameIndex] = [index, null];
			console.log(games);
			let data = {receiver: "DM", type: "gameCreated", data: gameToken};
			connection.sendUTF(
					JSON.stringify({"utf8Data": data}));
			console.log(JSON.stringify({"utf8Data": data}));
			return;
		}

		if(json.type == "joinGame"){
			console.log("join Game");
			let token = json.data;
			let joined = false;
			let gameIndex = games.indexOf(token)
			if(gameIndex!=-1){
				if(gameClients[gameIndex][1] === null){
					gameClients[gameIndex][1] = index;
					joined = true;
				}else if(gameClients[gameIndex][0] === null){
					gameClients[gameIndex][0] = index;
					joined = true;
				}else{
					console.log("Joining failed");
					let data = {receiver: "DM", type: "gameJoined", data: -1};
					connection.sendUTF(
							JSON.stringify({"utf8Data": data}));
							console.log(games);
							console.log(gameClients);
				}
				if(joined){
					console.log("joined succesfully");
					gameToken = token;
					let data = {receiver: "DM", type: "gameJoined", data: token};
					connection.sendUTF(
							JSON.stringify({"utf8Data": data}));
					data = {receiver: "DM", type: "enemyJoined", data: token};
					console.log("Inform the enemy that the Game is ready");
					clients[gameSelect(index, gameToken)].sendUTF(
							JSON.stringify({"utf8Data": data}));
					console.log(games);
					console.log(gameClients);
					return;
				}

			}else{
				console.log("Joining failed");
				let data = {receiver: "DM", type: "gameJoined", data: -1};
				connection.sendUTF(
						JSON.stringify({"utf8Data": data}));
						console.log(games);
			}
			return;
		}

		//Sonstige Nachrichten an Mitspieler weiterleiten
		message = JSON.stringify(message);
		console.log("Send message to index: "+gameSelect(index, gameToken)+": "+message);
		clients[gameSelect(index, gameToken)].sendUTF(message);

	// end of onMessage
	});

	// user disconnected
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer "+ connection.remoteAddress + " disconnected.");
		if(gameToken != null){
			gameIndex = games.indexOf(gameToken);
			if(gameClients[gameIndex][0] == index){
				gameClients[gameIndex][0] = null;
			}else{
				gameClients[gameIndex][1] = null;
			}
			if(gameClients[gameIndex][0] == null && gameClients[gameIndex][1] == null){
				gameClients.splice(gameIndex);
				games.splice(gameIndex);
			}else{
                let data = {receiver: "DM", type: "enemyDisconnected", data: gameToken};
				if(gameClients[gameIndex][0] == null){
					clients[gameClients[gameIndex][1]].sendUTF(
                        JSON.stringify({"utf8Data": data}));
				}else{
					clients[gameClients[gameIndex][0]].sendUTF(
                        JSON.stringify({"utf8Data": data}));
				}
			}
		}
		// remove user from the list of connected clients
		clients.splice(index, 1);
	});

// end of onRequest
});
//
//
//
function gameSelect(index, gameToken){
	gameIndex = games.indexOf(gameToken);
	if(gameClients[gameIndex][0] == index){
		return gameClients[gameIndex][1];
	}else if(gameClients[gameIndex][1] == index){
		return gameClients[gameIndex][0];
	}
}

function randomTokenNotInArray(){
	var token;
	do{
		token = Math.random().toString(36).substring(7);
	}
	while(games.indexOf(token)!=-1);
	return token;
}
// Send am json message
//var json = JSON.stringify({ type:'message', data: obj });
//for (var i=0; i < clients.length; i++) {
//  clients[i].sendUTF(json);
//}
