const http = require('http');

const employeeController = require('./controllers/EmployeeController.js');
const routes = require('./routes');
const router = require('./router');

const server = http.createServer(async (req, res) => {
    // console.log('req method', req.method);
    // console.log('req url', req.url);

    const response = await router(req, res, routes);

	// if (req.method === 'GET') {
	// 	if (req.url === '/employee') {
	// 		const employees = await employeeController.getAllEmployees(req, res);
	// 	}
	// }
	// else if (req.method === 'POST') {
    //
	// }
	// else if (req.method === 'PUT') {
    //
	// }
	// else if (req.method === 'DELETE') {
    //
	// }
});

server.listen(3000, () => {
	console.log('Server is listening on port 3000');
});