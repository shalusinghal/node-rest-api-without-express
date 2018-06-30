const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BaseModel = require('./BaseModel');

const employeeSchema = new Schema({
    // Name of the employee
    name: {
        type: String,
        required: true
    },

    // Email of the employee
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        },
        required: true,
        unique: true
    },

    // Indicates if the employee is a manager. We are managing
    // employees and managers in same collection
    isManager: {
        type: Boolean,
        default: false
    },

    // List of employees who have this employee as manager
    peers: {
        type: Array,
        default: []
    },

    // Employee's manager
    managerId: {
        type: Schema.ObjectId
    }
}, { timestamps: true });

employeeSchema.method('toClient', function () {
    const employee = this.toObject();

    delete employee.__v;
    delete employee.deletedAt;
    delete employee.createdAt;
    delete employee.updatedAt;

    return employee;
});


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

    static findOneAndUpdate (conditions, updateData, options) {
        return new Promise((resolve, reject) => {
            employeeModel.findOneAndUpdate(conditions, updateData, options, (err, docs) => {
                if (docs) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    static update (conditions, updateData, options) {
        return new Promise((resolve, reject) => {
            employeeModel.update(conditions, updateData, options, (err, docs) => {
                if (docs) {
                    resolve(docs);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    static aggregation (pipeline) {
        return new Promise((resolve, reject) => {
            employeeModel.aggregate(pipeline, (err, docs) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(docs);
                }
            });
        });
    }
}


module.exports = Employee;