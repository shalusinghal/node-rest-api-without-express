/**
 * We define all our routes in this file. Routes are matched using `path`.
 * 1. If "path" is a string, then we simply match with url
 * 2. If "path is a object, then we assume it is a RegEx and use RegEx matching
 */

const employeeController = require('./controllers/EmployeeController');
const projectController = require('./controllers/ProjectController');

const routes = [
    {
        method: 'GET',
        path: '/employee',
        handler: employeeController.index.bind(employeeController)
    },
    {
        method: 'GET',
        path: /\/employee\/([0-9a-z]+)/,
        handler: employeeController.show.bind(employeeController)
    },
    {
        method: 'POST',
        path: '/employee',
        handler: employeeController.create.bind(employeeController)
    },
    {
        method: 'PUT',
        path: /\/employee\/([0-9a-z]+)/,
        handler: employeeController.update.bind(employeeController)
    },
    {
        method: 'DELETE',
        path: /\/employee\/([0-9a-z]+)/,
        handler: employeeController.delete.bind(employeeController)
    },
    {
        method: 'POST',
        path: '/project',
        handler: projectController.create.bind(projectController)
    },
    {
        method: 'GET',
        path: '/project',
        handler: projectController.index.bind(projectController)
    },
    {
        method: 'GET',
        path: /\/project\/([0-9a-z]+)/,
        handler: projectController.show.bind(projectController)
    },
    {
        method: 'PUT',
        path: /\/project\/([0-9a-z]+)/,
        handler: projectController.update.bind(projectController)
    },
    {
        method: 'DELETE',
        path: /\/project\/([0-9a-z]+)/,
        handler: projectController.delete.bind(projectController)
    },
];

module.exports = routes;