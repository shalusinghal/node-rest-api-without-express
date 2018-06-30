const mongoose = require('mongoose');
const Employee = require('./../models/Employee');
const Project = require('./../models/Project');
const helpers = require('./../common/helpers');

class EmployeeController {
    // GET /employee
    async index (req, res) {
        try {
            const selectParams = {
                _id: 1,
                name: 1,
                email: 1
            };

            const employees = await Employee.getAll({}, selectParams);

            return helpers.success(res, employees);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // POST /employee
    async create (req, res, param, postData) {
        postData = JSON.parse(postData);
        let { name, email, isManager = false, managerId = null, peers = [] } = postData;

        try {
            let manageExists = await this.validateManager(managerId);

            if (!manageExists) {
                return helpers.validationError(res, 'managerId is invalid');
            }

            if (managerId !== null) {
                managerId = mongoose.Types.ObjectId(managerId);
            }

            if (! (peers instanceof Array)) {
                peers = [peers];
            }

            let peersExists = await this.validatePeers(peers, isManager);

            if (!peersExists) {
                return helpers.validationError(res, 'Peer(s) is invalid');
            }

            if (peers.length > 0) {
                peers = peers.map((el) => { return mongoose.Types.ObjectId(el); });
            }

            const employee = await Employee.create({ name, email, isManager, managerId, peers });

            return helpers.success(res, employee.toClient());
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, error);
            }
            else if (error.message.indexOf('duplicate key error') !== -1) {
                return helpers.validationError(res, 'Email already exists');
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // GET /employee/:id
    async show (req, res, param) {
        try {
            const pipeline = [
                {
                    "$match" : {
                        "_id" : mongoose.Types.ObjectId(param)
                    }
                },
                {
                    "$project" : {
                        "_id" : 1,
                        "isManager" : 1,
                        "name" : 1,
                        "email" : 1,
                        "managerId" : 1
                    }
                },
                {
                    "$lookup" : {
                        "from" : "employees",
                        "localField" : "managerId",
                        "foreignField" : "_id",
                        "as" : "manager"
                    }
                },
                {
                    "$project" : {
                        "manager" : {
                            "isManager" : 0,
                            "peers" : 0,
                            "managerid" : 0,
                            "createdAt" : 0,
                            "updatedAt" : 0,
                            "__v" : 0
                        },
                        "managerId" : 0
                    }
                },
                {
                    "$lookup" : {
                        "from" : "projects",
                        "localField" : "_id",
                        "foreignField" : "employeeIds",
                        "as" : "projects"
                    }
                },
                {
                    "$project" : {
                        "projects" : {
                            "employeeIds" : 0,
                            "managerId" : 0,
                            "createdAt" : 0,
                            "updatedAt" : 0,
                            "__v" : 0
                        }
                    }
                }
            ];

            const employee = await Employee.aggregation(pipeline);

            return helpers.success(res, employee);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // PUT /employee/:id
    async update (req, res, param, postData) {
        let employee;
        try {
            employee = await Employee.get({ _id: param }, { isManager: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!employee) {
            return helpers.error(res, 'Entity not found', 404);
        }

        postData = JSON.parse(postData);
        let updateData = {
            isManager: employee.isManager
        };

        if (postData.name) {
            updateData.name = postData.name;
        }

        if (postData.email) {
            updateData.email = postData.email;
        }

        if (postData.isManager) {
            updateData.isManager = true;
        }

        let { managerId = null, peers = null } = postData;

        try {
            let manageExists = await this.validateManager(managerId);

            if (!manageExists) {
                return helpers.validationError(res, 'managerId is invalid');
            }

            if (managerId !== null) {
                updateData.managerId = mongoose.Types.ObjectId(managerId);
            }

            if (peers !== null && ! (peers instanceof Array)) {
                peers = [peers];
            }

            let peersExists = await this.validatePeers(peers, updateData.isManager);

            if (!peersExists) {
                return helpers.validationError(res, 'Peer(s) is invalid');
            }

            if (peers && peers.length > 0) {
                peers = peers.map((el) => { return mongoose.Types.ObjectId(el); });
            }

            if (peers !== null) {
                updateData.peers = peers;
            }

            const employee = await Employee.findOneAndUpdate({ _id: param }, { $set: updateData }, { new: true });

            return helpers.success(res, employee.toClient());
        }
        catch (error) {
            console.log(error);
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, ...error);
            }
            else if (error.message.indexOf('duplicate key error') !== -1) {
                return helpers.validationError(res, 'Email already exists');
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // DELETE /employee/:id
    async delete (req, res, param) {
        let employee;
        try {
            employee = await Employee.get({ _id: param }, { isManager: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!employee) {
            return helpers.error(res, 'Entity not found', 404);
        }

        try {
            let conditions = { _id: param };
            await Employee.remove(conditions);

            // set manager to null
            conditions = {managerId: mongoose.Types.ObjectId(param)};
            let update = { $set: { managerId: null } };
            await Employee.update(conditions, update, {multi: true});

            // delete manager to null
            update = { $pull: { peers: mongoose.Types.ObjectId(param) } };
            await Employee.update({}, update, {multi: true});

            // delete employee from project
            update = { $pull: { employees: mongoose.Types.ObjectId(param) } };
            await Project.update({}, update, {multi: true});

            return helpers.success(res);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // Checks if a manager with given id exists
    async validateManager (managerId) {
        if (managerId === null) {
            return true;
        }

        try {
            const managerExists = await Employee.get({ _id: managerId, isManager: true });
            return !!(managerExists);
        }
        catch (e) {
            return false;
        }
    }

    // Checks if all the peers exist in database
    async validatePeers (peers, isManager) {
        if (peers === null) {
            return true;
        }

        if (peers.length && !isManager) {
            return false;
        }

        try {
            const peersExists = await Employee.getAll({ _id: {$in: peers} }, { _id: 1 });
            return (peersExists.length === peers.length) ;
        }
        catch (e) {
            return false;
        }
    }
}

module.exports = new EmployeeController();
