const fs = require('fs');
const net = require('net');
let clients = [];
let messages = [];
let server = net.createServer(socket => {
    clients.push(socket);
    console.log(`Client ${clients.indexOf(socket).toString()} Connected.`);
    messages.push(`Client ${clients.indexOf(socket).toString()} Connected.\n`);
    fs.writeFile('chat-log.txt', messages, 'utf8', function (err) {
        if (err) return console.log(err);
    });
    for (let i = 0; i < clients.length; i++) {
        clients[i].write(`Client ${clients.indexOf(socket).toString()} Connected.`);
    }
    socket.write(`welcome to the chat-room, you are Client ${clients.indexOf(socket).toString()}.`);
    socket.on('data', data => {
        console.log(`Client ${clients.indexOf(socket).toString()}: ${data}`);
        handleData(data, socket);
        messages.push(`Client ${clients.indexOf(socket).toString()}: ${data}`);
        fs.writeFile('chat-log.txt', messages, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
    socket.on('end', () => {
        console.log(`Client ${clients.indexOf(socket).toString()} Disconnected.`);
        messages.push(`Client ${clients.indexOf(socket).toString()} Disconnected.\n`);
        fs.writeFile('chat-log.txt', messages, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        for (let i = 0; i < clients.length; i++) {
            if (clients[i] != clients[clients.indexOf(socket)]) {
                clients[i].write(`Client ${clients.indexOf(socket).toString()} Disconnected.`);
            }
        }
        clients.splice(clients.indexOf(socket));
    });
}).listen(5000);
console.log('Server Listening on Port: 5000.');
server.on(`error`, (err)  => {
    console.log('error --');
    throw err;
});
server.on('data', data => {
    handleData(data)
});
function handleData(data, socket){
    if (data) {
        if (data.toString() === '/help\n') {
            socket.write(`\nCommands:\n`);
            socket.write(`'/help' - list commands. Usage: 'help'\n`);
            socket.write(`'/w' - whisper to specified client. Usage: '/w # text'\n`);
        } else
        for (let i = 0; i < clients.length; i++) {
            if (clients[i] !== clients[clients.indexOf(socket)]) {
                if (data.includes(`/w `)) {
                    if (data.toString().slice(0, 4) === (`/w ${clients.indexOf(clients[i])}`)) {
                        clients[i].write(`Client ${clients.indexOf(socket)} whispered: ${data.slice(5, data.length)}`);
                    }
                } else if (clients[i] !== socket) {
                    clients[i].write(`Client ${clients.indexOf(socket).toString()}: ${data}`);
                } else {
                    console.log('Invalid Client');
                }
            }
        }
    }
}