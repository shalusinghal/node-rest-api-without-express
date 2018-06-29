const http = require('http');

const routes = require('./routes');
const router = require('./router');

const server = http.createServer(async (req, res) => {
    await router(req, res, routes);
});

server.listen(3000, () => {
	console.log('Server is listening on port 3000');
});