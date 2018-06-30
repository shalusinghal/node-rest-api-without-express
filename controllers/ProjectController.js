const Project = require('./../models/Project');
const helpers = require('./../common/helpers');
const Employee = require('./../models/Employee');

const mongoose = require('mongoose');

class ProjectController {
    // GET /project
    async index (req, res) {
        try {
            const selectParams = {
                _id: 1,
                name: 1,
                managerId: 1,
                employeeIds: 1
            };

            const projects = await Project.getAll({}, selectParams);

            return helpers.success(res, projects);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // POST /project
    async create (req, res, param, postData) {
        postData = JSON.parse(postData);

        let { name, employeeIds = [], managerId = null } = postData;

        if (! (employeeIds instanceof Array)) {
            employeeIds = [employeeIds];
        }

        try {
            let manageExists = await this.validateManager(managerId);

            if (!manageExists) {
                return helpers.validationError(res, 'Manager is invalid');
            }

            let employeesExists = await this.validateEmployees(employeeIds);

            if (!employeesExists) {
                return helpers.validationError(res, 'Employee(s) is invalid');
            }

            employeeIds = employeeIds.map(element => { return mongoose.Types.ObjectId(element) });

            if (managerId !== null) {
                managerId = mongoose.Types.ObjectId(managerId);
            }

            const project = await Project.create({ name, employeeIds, managerId });

            return helpers.success(res, project);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, error);
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // GET /project/:id
    async show (req, res, param) {
        try {
            const aggPipeline = [
                {
                    "$match" : {
                        "_id" : mongoose.Types.ObjectId(param)
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
                    "$lookup" : {
                        "from" : "employees",
                        "localField" : "employeeIds",
                        "foreignField" : "_id",
                        "as" : "employees"
                    }
                },
                {
                    "$project" : {
                        "_id" : 1,
                        "name" : 1,
                        "manager" : {
                            "_id" : 1,
                            "name" : 1
                        },
                        "employees" : {
                            "_id" : 1,
                            "name" : 1
                        }
                    }
                }
            ];

            const project = await Project.aggregation(aggPipeline);

            return helpers.success(res, project);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // PUT /project/:id
    async update (req, res, param, postData) {
        param = mongoose.Types.ObjectId(param);

        let project;
        try {
            project = await Project.get({ _id: param }, { _id: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!project) {
            return helpers.error(res, 'Entity not found', 404);
        }

        let updateData = {};
        postData = JSON.parse(postData);

        if (postData.name) {
            updateData.name = postData.name;
        }

        let { managerId = null, employeeIds = [] } = postData;

        if (! (employeeIds instanceof Array)) {
            employeeIds = [employeeIds];
        }

        try {
            let manageExists = await this.validateManager(managerId);

            if (!manageExists) {
                return helpers.validationError(res, 'managerId is invalid');
            }

            if (managerId !== null) {
                updateData.managerId = mongoose.Types.ObjectId(managerId);
            }

            let employeesExists = await this.validateEmployees(employeeIds);

            if (!employeesExists) {
                return helpers.validationError(res, 'EmployeeIds is invalid');
            }

            employeeIds = employeeIds.map(element => { return mongoose.Types.ObjectId(element) });

            if (employeeIds.length > 0) {
                updateData.employeeIds = employeeIds;
            }

            const options = {
                fields: {
                    name: 1,
                    employeeIds: 1,
                    managerId: 1
                },
                new: true
            };

            const project = await Project.findOneAndUpdate({ _id: param }, {$set: updateData}, options);

            return helpers.success(res, project);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, error);
            }
            else {
                console.log(error);
                return helpers.error(res);
            }
        }
    }

    // DELETE /employee/:id
    async delete (req, res, param) {
        param = mongoose.Types.ObjectId(param);

        let project;
        try {
            project = await Project.get({ _id: param }, { _id: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!project) {
            return helpers.error(res, 'Entity not found', 404);
        }

        try {
            let conditions = { _id: param };

            await Project.remove(conditions);

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
    async validateEmployees (employeeIds) {
        if (! (employeeIds instanceof Array)) {
            employeeIds = [employeeIds];
        }

        if (employeeIds.length === 0) {
            return true;
        }

        try {
            const employeesExists = await Employee.getAll({ _id: {$in: employeeIds} }, {_id: 1});
            return (employeesExists.length === employeeIds.length) ;
        }
        catch (e) {
            return false;
        }
    }
}

module.exports = new ProjectController();
