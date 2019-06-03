const fs = require('fs');
const net = require('net');
let clients = [];
let messages = [];
let users = [];
let adminpword = 'schlenker';
let clientlist = [];
let server = net.createServer(socket => {
    clients.push(socket);
    users.push('empty');
    console.log(`Client ${clients.indexOf(socket).toString()} Connected. `);
    messages.push(`Client ${clients.indexOf(socket).toString()} Connected. `);
    fs.writeFile('chat-log.txt', messages, 'utf8', function (err) {
        if (err) return console.log(err);
    });
    for (let i = 0; i < clients.length; i++) {
        clients[i].write(`Client ${clients.indexOf(socket).toString()} Connected. `);
    }
    socket.write(`welcome to the chat-room, you are Client ${clients.indexOf(socket).toString()}.`);
    socket.on('data', data =>  {
        for (let i = 0; i < clients.length; i++) {
            if (clients[i] === socket) {
                if (users[i] !== 'empty') {
                    console.log(`${users[i]}: ${data}`);
                } else
                {
                    console.log(`Client ${clients.indexOf(socket).toString()}: ${data}`);
                }
            }
        }

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
            socket.write(`'/clientlist' - list connected clients. Usage: '/clientlist'`);
            socket.write(`'/username' - assign yourself a username. Usage: '/username insertNameHere'`);
        } else if (data.toString() === '/clientlist\n') {
            socket.write('Client List:');
            for (let i = 0; i < clients.length; i++) {
                socket.write(`Client ${clients[i].index}`)
            }
        } else
        for (let i = 0; i < clients.length; i++) {
            if (clients[i] === socket) {
                if (data.includes(`/username `)) {
                    users[i] = data.toString().slice(10, data.length).trim();

                    console.log(users[i]);
                    console.log(users);
                } else if (data.includes(`/clientlist`)) {
                    if (data.toString().slice(0, 12) === `/clientlist`) {
                        clientlist = [];
                        for (let k = 0; k < clients.length; k++) {
                            clientlist.push(k);
                        }
                        socket.write(`By Client ID: ${clientlist}\n By Username: ${users}`.toString());
                    }
                }
            } else
            if (clients[i] !== clients[clients.indexOf(socket)]) {
                if (data.includes(`/w `)) {
                    console.log(`Data includes /w`);
                    if (data.toString().slice(0, 4) === (`/w ${clients.indexOf(clients[i])}`)) {
                        clients[i].write(`Client ${clients.indexOf(socket)} whispered: ${data.slice(5, data.length)}`);
                    } else if (data.toString().slice(0, 4) === (`/w ${users.indexOf(users[i])}`)) {
                        if (users[clients.indexOf(socket)] !== 'empty') {
                            clients[i].write(`${users[clients.indexOf(socket)]} whispered: ${data}`);
                        }
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