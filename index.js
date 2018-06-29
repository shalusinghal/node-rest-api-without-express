const http = require('http');

const routes = require('./routes');
const router = require('./router');

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log('uncaughtException');
    console.error(err.stack);
    console.log(err);
});


const server = http.createServer(async (req, res) => {
    await router(req, res, routes);
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});