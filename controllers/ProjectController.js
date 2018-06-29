const Project = require('./../models/Project');
const helpers = require('./../common/helpers');
const Employee = require('./../models/Employee');

const mongoose = require('mongoose');

class ProjectController {
    // GET /project
    async index (req, res) {
        try {
            const aggPipeline = [
                {
                    $match: {
                        "deletedAt": null
                    }
                },
                {
                    $lookup:
                        {
                            from: "employees",
                            localField: "employees",
                            foreignField: "_id",
                            as: "employeeData"
                        }
                },
                {
                    $unwind: {
                        "path": "$employeeData",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $match: {
                        "employeeData.deletedAt": null
                    }
                },
                {
                    $group: {
                        _id:"$_id",
                        employees:{
                            $push:"$employeeData.name"
                        },
                        name: {$first: "$name"},
                        manager: {$first: "$manager"}
                    },
                },
                {
                    $lookup:
                        {
                            from: "employees",
                            localField: "manager",
                            foreignField: "_id",
                            as: "managerData"
                        }
                },
                {
                    $project: {
                        _id:1,
                        employees: 1,
                        name: 1,
                        managerData: {name: 1}
                    }
                }
            ];

            const projects = await Project.aggregation(aggPipeline);

            return helpers.success(res, projects);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // POST /project
    async create (req, res, param, postData) {
        postData = JSON.parse(postData);

        let { name, employees = [], manager = null } = postData;

        if (! (employees instanceof Array)) {
            employees = [employees];
        }

        try {
            let manageExists = await this.validateManager(manager);

            if (!manageExists) {
                return helpers.validationError(res, 'Manager is invalid');
            }

            let employeesExists = await this.validateEmployees(employees);

            if (!employeesExists) {
                return helpers.validationError(res, 'Employee(s) is invalid');
            }

            employees = employees.map(element => { return mongoose.Types.ObjectId(element) });

            if (manager !== null) {
                manager = mongoose.Types.ObjectId(manager);
            }

            const project = await Project.create({ name, employees, manager });

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
    async show(req, res, param) {
        try {
            const aggPipeline = [
                {
                    $match: {
                        "deletedAt": null,
                        "_id": mongoose.Types.ObjectId(param)
                    }
                },
                {
                    $lookup:
                        {
                            from: "employees",
                            localField: "employees",
                            foreignField: "_id",
                            as: "employeeData"
                        }
                },
                {
                    $unwind: {
                        "path": "$employeeData",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $match: {
                        "employeeData.deletedAt": null
                    }
                },
                {
                    $group: {
                        _id:"$_id",
                        employees:{
                            $push:"$employeeData.name"
                        },
                        name: {$first: "$name"},
                        manager: {$first: "$manager"}
                    },
                },
                {
                    $lookup:
                        {
                            from: "employees",
                            localField: "manager",
                            foreignField: "_id",
                            as: "managerData"
                        }
                },
                {
                    $project: {
                        _id:1,
                        employees: 1,
                        name: 1,
                        managerData: {name: 1}
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
        let updateData = {};
        postData = JSON.parse(postData);

        if (postData.name) {
            updateData.name = postData.name;
        }

        let { manager = null, employees = [] } = postData;

        if (! (employees instanceof Array)) {
            employees = [employees];
        }

        try {
            let manageExists = await this.validateManager(manager);

            if (!manageExists) {
                return helpers.validationError(res, 'Manager is invalid');
            }

            if (manager !== null) {
                updateData.manager = mongoose.Types.ObjectId(manager);
            }

            let employeesExists = await this.validateEmployees(employees);

            if (!employeesExists) {
                return helpers.validationError(res, 'Employee(s) is invalid');
            }

            employees = employees.map(element => { return mongoose.Types.ObjectId(element) });

            if (employees.length > 0) {
                updateData.employees = employees;
            }

            const project = await Project.update({ _id: param, deletedAt: null }, {$set: updateData}, {new: true});

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
    async delete(req, res, param) {
        try {
            let conditions = { _id: param, deletedAt: null };

            await Project.update(conditions, {$set: {deletedAt: new Date()}});

            return helpers.success(res);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // Checks if a manager with given id exists
    async validateManager (manager) {
        if (manager === null) {
            return true;
        }

        try {
            const managerExists = await Employee.get({ _id: manager, isManager: true, deletedAt: null });
            return !!(managerExists);
        }
        catch (e) {
            return false;
        }
    }

    // Checks if all the peers exist in database
    async validateEmployees (employees) {
        if (! (employees instanceof Array)) {
            employees = [employees];
        }

        if (employees.length === 0) {
            return true;
        }

        try {
            const employeesExists = await Employee.getAll({_id: {$in: employees}, deletedAt: null}, {_id: 1});
            return (employeesExists.length === employees.length) ;
        }
        catch (e) {
            return false;
        }
    }
}

module.exports = new ProjectController();
