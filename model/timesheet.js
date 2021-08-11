var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
    employeeid: String,
    data: [{
        year: {type: String},
        yearData: [monthSchema],
    }],
    employee: {type: Schema.Types.ObjectId, ref: 'Employee'},
    //data: [{type: [Schema.Types.Mixed], data:[childSchema]}],

}, {strict: false});

module.exports = mongoose.model("TimeSheet", TimeSheetSchema);