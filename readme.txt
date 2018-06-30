Requirements
~~~~~~~~~~~~

1. Node.js v10.5.0
2. MongoDB v3.6

How to run
~~~~~~~~~~

1. Make sure mongodb server is running.
2. Goto application code directory and run npm install.
3. Modify the connection string config.js
4. Run "node index.js"

Project Structure
~~~~~~~~~~~~~~~~~

1. index.js - Bootstraps the application
2. config.js - Database and other configurations
3. router.js - Custom router for routing endpoints
4. routes.js - List of routes (api endpoints in the project)
5. common - Some common functions/helpers that are used throught the project.
6. models - Project's models
7. controllers - Project's controllers

Request Requirements
~~~~~~~~~~~~~~~~~~~~

1. API is JSON based
2. All requests should have 'Content-Type: application/json' header set
3. Request body for POST and PUT should be in JSON format.

Models
~~~~~~
(I have assumed manager and employee as same entity and distinguished them with 'isManager' property)
Employee:
{
    name: ""                // Name of the employee,
    email: ""               // Email of the employee
    isManager: true/false   // If the employee is a manager or not
    peers: []               // Array of employee who have this employee as manager
    managerId: ""           // If of this employee's manager
}

Project:
{
    name: ""                // Name of the project,
    employeeIds: []         // Array of employees who are part of this project
    managerId: ""           // Id of this project's manager
}

Example Requests and Responses
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

GET localhost:3000/employee
Response:
{
    "status": "success",
    "data": [
        {
            "_id": "5b35af170177f90fd68fedd9",
            "name": "Shalu Singhal",
            "email": "shalu@gmail.com"
        },
        {
            "_id": "5b366b7e38acd914fa966289",
            "name": "John Doe",
            "email": "john@example.com"
        },
        {
            "_id": "5b366eb23259a415335f80c2",
            "name": "Ram Dev",
            "email": "ram@example.com"
        }
    ]
}

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

POST localhost:3000/employee
Body:
{
    "name": "Garry Tan",
    "email": "garry@example.com",
	"manager": "5b35af170177f90fd68fedd9",
	"peers": [ "5b370dfb1cf2c415cfe9c62a" ],
	"isManager": true
}

Response:
{
    "status": "success",
    "data": {
        "_id": "5b3743f3afcb981bf0958e97",
        "isManager": false,
        "name": "Garry Tan",
        "email": "garry@example.com",
        "managerId": "5b35af170177f90fd68fedd9",
        "peers": [ "5b370dfb1cf2c415cfe9c62a" ]
    }
}

Note: I have kept the project simple so that you get idea of my programming capabilities. This just a proof of concept and is in no way
a good ready to use REST API.