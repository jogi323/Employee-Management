var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Employee = require("./empschema");
// mongoose.connect('mongodb://empinfo:empinfo@ds155631.mlab.com:55631/empinfo');

var daySchema = new Schema({
     day: String,
     dayData: {
         desc: String,
         day: Date,
         time: String
     } 
});

var monthSchema = new Schema({
     month: String,
     monthData: [daySchema] 
});

var TimeSheetSchema = new Schema({
    employeeid: {type: Number, unique: true},
    data: [{
        year: {type: String},
        yearData: [monthSchema],
    }],
    employee: {type: String, ref: 'Employee'},
    //data: [{type: [Schema.Types.Mixed], data:[childSchema]}],

}, {strict: false});

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);