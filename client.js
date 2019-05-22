const net = require('net');        // Client Code  .
const client = net.createConnection({ port: 5000 }, () => {
    console.log('connected to server on port: 5000.');
});
client.on('data', (data) => {
    console.log(data.toString());
});
client.on('end', () => {
    console.log('Server Terminated.');
    client.end();
    console.clear();
    process.exit();
});
client.on('error', () => {
    console.log('error occurred.');
    client.end();
});
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
        client.write(chunk);
        if(chunk.toString().trim() == 'quit'){
            process.exit();
        }
    }
});
process.stdin.on('end', () => {
    process.stdout.write('end');
});