const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BaseModel = require('./BaseModel');

const employeeSchema = new Schema({
    // Name of the employee
    name: {
        type: String, required: true
    },

    // Email of the employee
    email: {
        type: String, required: true, unique: true
    },

    // Indicates if the employee is a manager. We are managing
    // employees and managers in same collection
    isManager: {
        type: Boolean, default: false
    },

    // List of employees who have this employee as manager
    peers: {
        type: Array, default: []
    },

    // List employee's projects
    projects: {
        type: Array, default: []
    },

    // Employee's manager
    manager: {
        type: String
    },

    // Indicates if this employee is deleted. While deleting employee, we do not
    // remove the record, we simply set it's deleted at to current time
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });


const employeeModel = BaseModel.model('employees', employeeSchema);

class Employee {
    static create (data) {
        const newEmployee = employeeModel(data);

        return new Promise((resolve, reject) => {
            const error = newEmployee.validateSync();
            if (error) {
                reject(error);
            }

            newEmployee.save((err, obj) => {
                if (obj) {
                    resolve(obj);
                }
                else {
                    console.log(err);
                    reject(err);
                }
            });
        });
    }

    static getAll (conditions, selectParams) {
        return new Promise((resolve, reject) => {
            const query = employeeModel.find(conditions);

            if (selectParams) {
                query.select(selectParams);
            }

            query.lean().exec((err, docs) => {
                if (docs) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    static get (conditions, selectParams) {
        return new Promise((resolve, reject) => {
            const query = employeeModel.findOne(conditions);

            if (selectParams) {
                query.select(selectParams);
            }

            query.lean().exec((err, docs) => {
                if (docs) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    static remove (conditions) {
        return new Promise((resolve, reject) => {
            employeeModel.remove(conditions, (err, docs) => {
                if (docs) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    }
}


module.exports = Employee;