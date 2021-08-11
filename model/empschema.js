var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TimeSheets = require('./timesheet');
// var  autoIncrement = require('mongoose-auto-increment');
// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://empinfo:empinfo@cluster0.8xam9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// var connection =mongoose.connect(uri);

// autoIncrement.initialize(connection);

var schema = new Schema({
    employeeId: {type: Number, unique: true},
    employeeName: {type: String, required: true},
    
    employeeType: {type: String, required: true},
    role: {type: String, required: true},
    username:{type: String, required: true},
    password:{type: String, required: true},
    // department: {type: String, required: true},
    designation: {type: String, required: true},
    // practice: {type: String, required: true},
    // workLocation: {type: String, required: true},
    companyEmail: {type: String, required: false},
    personalEmail: {type: String, required: true},
    primaryMobile: {type: String, required: true},
    alternateMobile: {type: String, required: false},
    joinedOn: {type: String, required: true},
    status:{type:String, required:true},
    dob: {type: String, required: false},
    payRollType: {type: String, required: true},
    cost: {type: String, required: true},
    address:{type:String},
    manager : {type: String},
    empImage:{type:String},
    reportingTo: [{type: Schema.Types.ObjectId, ref: 'Employee'}],
    reportingToHim: [{type: Schema.Types.ObjectId, ref: 'Employee'}],
    firstLogin:{type:Boolean,default:true},
    otp:{type:String, expireAfterSeconds: 300 },
    timesheets: {type: Schema.Types.ObjectId, ref: 'TimeSheets'},
    _id: String
    //tmesheets: [{type: Schema.Types.ObjectId, ref: 'TimeSheets'}]
});
// schema.plugin(autoIncrement.plugin, {
//     model: 'Employee',
//     field: 'employeeId',
//     startAt: 1,
//     incrementBy: 1
// });

// employeeId, employeeName, companyEmail are set a index to search the employee using those fields
schema.index({employeeId: "text", employeeName:"text", companyEmail:"text" });

//exporting the schema 
module.exports = mongoose.model('Employee', schema);