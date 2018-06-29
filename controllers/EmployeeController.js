const Employee = require('./../models/Employee.js');
const helpers = require('./../common/helpers.js');

class EmployeeController {
    // GET /employee
    async index (req, res) {
        try {
            const selectParams = {
                _id: -1,
                id: 1,
                name: 1,
                email: 1,
            };

            const employees = await Employee.getAll({ deletedAt: null }, selectParams);

            return helpers.success(res, employees);
        }
        catch(error) {
            return helpers.error(res, error);
        }
    }

    // POST /employee
    async create (req, res, param, postData) {
        let { name, email, isManager = false, manager = null, peers = [] } = postData;

        try {
            let manageExists = await this.validateManager(manager);

            if (!manageExists) {
                return helpers.validationError(res, 'Manager is invalid');
            }

            let peersExists = await this.validatePeers(peers, isManager);

            if (!peersExists) {
                return helpers.validationError(res, 'Peer(s) is invalid');
            }

            const employee = await Employee.create({ name, email, isManager, manager, peers });

            return helpers.success(res, employee);
        }
        catch(error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, ...error);
            }
            else if (error.message.indexOf('Duplicate key error') !== -1) {
                return helpers.validationError(res, 'Email already exists');
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // GET /employee/:id
    async show(req, res, param) {
        try {
            let conditions = { _id: param, deletedAt: null };

            const selectParams = {
                _id: -1,
                id: 1,
                name: 1,
                email: 1,
            };

            const employee = await Employee.get(conditions, selectParams);

            return helpers.success(res, employee);
        }
        catch(error) {
            return helpers.error(res, error);
        }
    }

    // PUT /employee/:id
    async update (req, res, param, postData) {
        let { name, email, isManager = false, manager = null, peers = [] } = postData;

        try {
            let manageExists = await this.validateManager(manager);

            if (!manageExists) {
                return helpers.validationError(res, 'Manager is invalid');
            }

            let peersExists = await this.validatePeers(peers, isManager);

            if (!peersExists) {
                return helpers.validationError(res, 'Peer(s) is invalid');
            }

            const employee = await Employee.update({ _id: param, deletedAt: null }, { name, email, isManager, manager, peers });

            return helpers.success(res, employee);
        }
        catch(error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, ...error);
            }
            else if (error.message.indexOf('Duplicate key error') !== -1) {
                return helpers.validationError(res, 'Email already exists');
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // DELETE /employee/:id
    async delete(req, res, param) {
        try {

            // delete the employee from peers
            // set manager to null
            let conditions = { _id: param, deletedAt: null };

            await Employee.remove(conditions);

            return helpers.success(res);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // Checks if a manager with given id exists
    async validateManager (manager) {
        if (manager == null) {
            return true;
        }

        try {
            const managerExists = await Employee.get({_id: manager, isManager: true});
            return !!(managerExists);
        }
        catch (e) {
            return false;
        }
    }

    // Checks if all the peers exist in database
    async validatePeers (peers, isManager) {
        if (! (peers instanceof Array)) {
            peers = [peers];
        }

        if (peers.length === 0) {
            return true;
        }

        if (peers && !isManager) {
            return false;
        }

        try {
            const peersExists = await Employee.getAll({_id: {$in: peers}}, {_id: 1});
            return (peersExists.length === peers.length) ;
        }
        catch (e) {
            return false;
        }
    }
}

module.exports = new EmployeeController();
