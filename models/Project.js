const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BaseModel = require('./BaseModel');

const projectSchema = new Schema({
    // Name of the project
    name: {
        type: String, required: true
    },

    // List of employees who are working on project
    employees: {
        type: Array, default: []
    },

    // Project manager
    manager: {
        type: String
    },

    // Indicates if this project is deleted. While deleting project, we do not
    // remove the record, we simply set it's deleted at to current time
    deletedAt: {
        type: Date,
        default: null
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

    static update (conditions, updateData, options) {
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
}


module.exports = Project;