const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const baseModel = require('./BaseModel');

const employeeSchema = new Schema({
	name: {type: String},
	email: {type: String},
	isManager: {type: Boolean, default: false},
	peers: {type: Array, default: []},
	projects: {type: Array, default: []}
}, {timestamps: true});
