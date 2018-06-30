const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BaseModel = require('./BaseModel');

const projectSchema = new Schema({
    // Name of the project
    name: {
        type: String, required: true
    },

    // List of employees who are working on project
    employeeIds: {
        type: Array, default: []
    },

    // Project manager
    managerId: {
        type: Schema.ObjectId
    }
}, { timestamps: true });


const projectModel = BaseModel.model('projects', projectSchema);

class Project {
    static create (data) {
        const newProject = projectModel(data);

        return new Promise((resolve, reject) => {
            const error = newProject.validateSync();
            if (error) {
                reject(error);
            }

            newProject.save((err, obj) => {
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
            const query = projectModel.find(conditions);

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
            const query = projectModel.findOne(conditions);

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
            projectModel.remove(conditions, (err, docs) => {
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
            projectModel.findOneAndUpdate(conditions, updateData, options, (err, docs) => {
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
            projectModel.aggregate(pipeline, (err, docs) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(docs);
                }
            });
        });
    }

    static update (conditions, updateData, options) {
        return new Promise((resolve, reject) => {
            projectModel.update(conditions, updateData, options, (err, docs) => {
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


module.exports = Project;