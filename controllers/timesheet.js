const uri = "mongodb://empinfo:empinfo@cluster0-shard-00-00.8xam9.mongodb.net:27017,cluster0-shard-00-01.8xam9.mongodb.net:27017,cluster0-shard-00-02.8xam9.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-2q2uo1-shard-0&authSource=admin&retryWrites=true&w=majority";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var TimeSheet = require('../model/timesheet');
var Employee = require('../model/empschema');
const { MongoClient } = require('mongodb');

exports.insertData = function (req, res) {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
        const db = client.db("EMPINFO");
        var Employee = db.collection("Employee");
        var TimeSheetCollection = db.collection("TimeSheet");
        var month = new Array();
        month[01] = "January";
        month[02] = "February";
        month[03] = "March";
        month[04] = "April";
        month[05] = "May";
        month[06] = "June";
        month[07] = "July";
        month[08] = "August";
        month[09] = "September";
        month[10] = "October";
        month[11] = "November";
        month[12] = "December";

        var date = req.body.day;
        var dateParts = date.split('-');
        var rMonth = month[Math.round(dateParts[1])];
        // console.log(month[Math.round(dateParts[1])])
        var rYear = dateParts[0];
        var rDay = dateParts[2].slice(0, 2);
        console.log("received date" + rDay);
        var workData = [];
        workData.push({ work: req.body.work, date: date, timeIn: req.body.timeIn, timeOut: req.body.timeOut })
        var newYear = { [rMonth]: workData };
        Employee.findOne({ _id: req.body.id }, function (err, employee) {
            console.log("employee========", employee);
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            if (employee.timesheets != null) {
                console.log("employee.timesheets========", employee.timesheets);
                TimeSheetCollection.findOne(employee.timesheets, function (err, timesheetData) {
                    console.log(timesheetData);
                    var DayFound = false;
                    for (var k = 0; k < timesheetData.data.length; k++) {
                        for (var i = 0; i < timesheetData.data[k].yearData.length; i++) {
                            for (var l = 0; l < timesheetData.data[k].yearData[i].monthData.length; l++) {
                                if (timesheetData.data[k].yearData[i].monthData[l].day == rDay) {
                                    var dayId = timesheetData.data[k].yearData[i].monthData[l]._id;
                                    DayFound = true;
                                    break;
                                }
                            }
                        }
                    }

                    var MonthFound = false;
                    for (var k = 0; k < timesheetData.data.length; k++) {
                        for (var i = 0; i < timesheetData.data[k].yearData.length; i++) {
                            if (timesheetData.data[k].yearData[i].month == rMonth) {
                                var monthId = (timesheetData.data[k].yearData[i]._id).toString();
                                MonthFound = true;
                                break;
                            }
                        }
                    }

                    var YearFound = false;

                    for (var j = 0; j < timesheetData.data.length; j++) {
                        if (timesheetData.data[j].year == rYear) {
                            var yearId = (timesheetData.data[j]._id).toString();
                            YearFound = true;
                            break;
                        }
                    }
                    //if year present and mathes the received year
                    if (YearFound) {
                        console.log("it matched the received year");
                        //if month matches the received month
                        if (MonthFound) {
                            //if record with same day there
                            if (DayFound) {
                                console.log("record with the date is present");
                            }
                            else {
                                var dWork = { desc: req.body.desc, day: req.body.day, time: req.body.time };
                                let matchedMonth;
                                timesheetData.data.forEach((yData) => {
                                    if (yData._id.toString() === yearId) {
                                        if (yData.yearData && yData.yearData.length) {
                                            yData.yearData.forEach((mData) => {
                                                if (mData._id.toString() === monthId) {
                                                    console.log("matched month data ====", mData);
                                                    matchedMonth = mData.month;
                                                }
                                            })
                                        }
                                    }
                                });
                                TimeSheetCollection.updateOne({ employeeid: employee.employeeId, "data.yearData.month": matchedMonth }, {
                                    $push: {
                                        "data.$.yearData.$[elem].monthData": { dayData: dWork, day: rDay, _id: new mongoose.Types.ObjectId() }
                                    }
                                },
                                    {
                                        arrayFilters: [
                                            { "elem.month": matchedMonth }
                                        ]
                                    }, (err, result) => {
                                        if (err) {
                                            throw err;
                                        } else {
                                            console.log("Result============", result);
                                            res.status(200).json({
                                                message: 'Saved message',
                                                //obj: result
                                            });
                                        }
                                    })
                            }
                        } else {
                            console.log("month not matched");
                            var dWork = { desc: req.body.desc, day: req.body.day, time: req.body.time, _id: new mongoose.Types.ObjectId()  };
                            var dayWork = [{ dayData: dWork, day: rDay }];
                            let monthData = { monthData: dayWork, month: rMonth, _id: new mongoose.Types.ObjectId()};
                            let matchedYear;
                            timesheetData.data.forEach((yData) => {
                                if (yData._id.toString() === yearId) {
                                    matchedYear = yData.year;
                                }
                            });
                            console.log("matchedYear", matchedYear)
                            TimeSheetCollection.updateOne({ employeeid: employee.employeeId, "data.year": matchedYear }, {
                                $push: {
                                    "data.$[elem].yearData": monthData
                                }
                            },
                                {
                                    arrayFilters: [
                                        { "elem.year": matchedYear }
                                    ]
                                }, (err, result) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        console.log("Result============", result);
                                        res.status(200).json({
                                            message: 'Saved message',
                                            //obj: result
                                        });
                                    }
                                })
                        }
                    }//if year present and mathes the received year

                    else {
                        console.log("year not matched");
                        //console.log(yearId)
                        var dWork = { desc: req.body.desc, day: req.body.day, time: req.body.time, _id: new mongoose.Types.ObjectId() }
                        var dayWork = [{ dayData: dWork, day: rDay }];
                        var mWork = [];
                        mWork.push({ monthData: dayWork, month: rMonth, _id: new mongoose.Types.ObjectId() });
                        console.log(mWork);
                        TimeSheetCollection.updateOne({ employeeid: employee.employeeId }, {
                            $push: {
                                "data": { year: rYear, yearData: mWork, _id: new mongoose.Types.ObjectId() }
                            }
                        }, (err, result) => {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log("Result============", result);
                                    res.status(200).json({
                                        message: 'Saved message',
                                        //obj: result
                                    });
                                }
                            })
                    }
                })

            }
            else {
                var timesheet = new TimeSheet({
                    employeeid: employee.employeeId,
                    employee: employee,
                    data: [{
                        year: rYear,
                        yearData: [{
                            month: rMonth,
                            monthData: [{
                                day: rDay,
                                dayData: {
                                    desc: req.body.desc,
                                    day: req.body.day,
                                    time: req.body.time
                                }
                            }]
                        }]
                    }]
                })
                TimeSheetCollection.insertOne(timesheet, function (err, result) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    // console.log("timesheets=========", result.insertedId.valueOf(), result.insertedId.toHexString());
                    Employee.findOneAndUpdate({ employeeId: employee.employeeId }, { $set: { timesheets: result.insertedId.valueOf() } }, { upsert: true }, function (err, resul) {
                        if (err) {
                            console.log("error in executing query");
                            throw err;
                        }
                        else {
                            //   console.log("modified data::::", resul);
                            // console.log(resul);
                            res.status(201).json({
                                message: 'Saved message',
                                obj: result
                            });
                        }
                    })
                    // employee.save();
                });
            }
        })
    })
        .catch((err) => {
            console.log("errrrrrrrrrrrrrrrrrrrr", err);
            throw err;
        });

}

exports.getData = function (req, res) {
    var id = req.params.id;
    console.log("Timesheet id" + id);
    TimeSheet.findById(id)
        .populate('employee', 'joinedOn')
        .exec(function (err, tsData) {
            // console.log(tsData);
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else {
                console.log(tsData);
                console.log(tsData.employee.joinedOn);

                var month = new Array();
                month[0] = "January"; month[01] = "February"; month[02] = "March"; month[03] = "April"; month[04] = "May"; month[05] = "June";
                month[06] = "July"; month[07] = "August"; month[08] = "September"; month[09] = "October"; month[10] = "November"; month[11] = "December";

                var joinedDateParts = tsData.employee.joinedOn.split('-');
                var joinedYear = joinedDateParts[0];
                var joinedMonth = month[Math.round(joinedDateParts[1])];
                var joinedDay = joinedDateParts[2];
                console.log(joinedYear + " " + joinedMonth + " " + joinedDay + " ");
                var dayData = []
                var monthData = []
                var yearData = []
                for (var i = 0; i < tsData.data.length; i++) {
                    for (var j = 0; j < tsData.data[i].yearData.length; j++) {
                        for (var k = 0; k < tsData.data[i].yearData[j].monthData.length; k++) {
                            // console.log(tsData.data[i].yearData[j].monthData[k].dayData)
                            var ts = [{ workingHours: tsData.data[i].yearData[j].monthData[k].dayData.time }, { date: tsData.data[i].yearData[j].monthData[k].dayData.day }]
                            dayData.push({ data: ts });
                            // console.log(dayData[tsData.data[i].yearData[j].monthData.length]);
                        }
                    }

                }
                console.log(dayData)

                res.json(dayData);
            }
        })
}

exports.getData1 = function (req, res) {
    TimeSheet.find({ _id: "59319ab9af8e430bf8f8bf26" }, { 'data.year': { $gte: 2017 } })
        .populate('employee', 'joinedOn')
        .exec(function (err, tsData) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else {
                console.log(tsData);
                console.log(tsData.employee.joinedOn);
                res.json(tsData)
            }
        })

};
exports.generatePayRoll = function (req, res) {
    console.log("req");
    console.log(req.body);
    var statusCode, message;
    var payType = req.body.paytype;
    var payYear = req.body.payYear;
    var payMonth = req.body.payMonth;
    var payMonthSub = payMonth.substring(0, 3);
    console.log(payYear);
    console.log(payType);
    console.log(payMonth);
    var payRollArray = [];
    var timesheetarray = [];
    var workHours;
    Employee.find({ payRollType: payType }, function (err, docs) {
        if (err) {
            console.log("error in executing query");
            throw err;
        } else if (docs[0] != null) {
            var docsLength = docs.length;
            var empid, empname, cost, address, timeSheetDataGlobal;
            for (var i = 0; i < docsLength; i++) {
                empid = docs[i].employeeId;
                empname = docs[i].employeeName;
                cost = docs[i].cost;
                address = docs[i].address;
                var timesheet = docs[i].timesheets;
                payRollArray.push({ EmployeeID: empid, EmployeeName: empname, BasePay: cost, BusinessUnit: address, timesheet: timesheet, totalHours: "" });
                timesheetarray.push(new mongoose.Types.ObjectId(payRollArray[i].timesheet))
            }
            TimeSheet.find({
                '_id': {
                    $in: timesheetarray
                }
            }, (err, timesheetdata) => {
                var count;
                if (err) {
                    console.log("error in executing query");
                    throw err;
                } else if (timesheetdata[0] != null) {
                    console.log("timesheetdata:" + timesheetdata);
                    var timesheetlength = timesheetdata.length;
                    console.log(timesheetlength);
                    for (var m = 0; m < timesheetlength; m++) {
                        count = 0;
                        employeeid = timesheetdata[m].employeeid;
                        console.log(employeeid);
                        timeSheetDataGlobal = timesheetdata[m].toObject().data;
                        console.log(timeSheetDataGlobal);
                        for (var i = 0; i < timeSheetDataGlobal.length; i++) {
                            var year = timeSheetDataGlobal[i].year;
                            if (year == payYear) {
                                // statusCode = "02";
                                console.log("selected year has some data");
                                var monthData = timeSheetDataGlobal[i].yearData;
                                for (var j = 0; j < monthData.length; j++) {
                                    var month = monthData[j].month;
                                    var monthSub = month.substring(0, 3);
                                    console.log(monthSub);
                                    if (payMonthSub == monthSub) {
                                        // statusCode = "04";
                                        statusCode = "00";
                                        console.log("selected month has some data");
                                        var selectedMonthData = monthData[j].monthData;
                                        for (var l = 0; l < selectedMonthData.length; l++) {
                                            var dayData = selectedMonthData[l].dayData.time;
                                            if (payType == "Monthly") {
                                                if (dayData != "") {
                                                    console.log(dayData);
                                                    count = count + parseInt(dayData);
                                                    console.log("count");
                                                    for (var k = 0; k < payRollArray.length; k++) {
                                                        if (employeeid == payRollArray[k].EmployeeID) {
                                                            console.log("same employee id");
                                                            payRollArray[k].totalHours = count;
                                                        } else {
                                                            console.log("not same employee id")
                                                        }
                                                    }
                                                }
                                            } else if (payType == "Weekly") {
                                                count = 0;
                                                console.log("selected pay type is weekly");
                                                var weeklyStartDate;
                                                if (payMonth[5] == "-") {
                                                    weeklyStartDate = payMonth.substring(4, 5);
                                                } else {
                                                    weeklyStartDate = payMonth.substring(4, 6);
                                                }
                                                console.log("weekly start date is:" + weeklyStartDate);
                                                var weekEndDate = parseInt(weeklyStartDate) + 6;
                                                console.log("weekly end date is:" + weekEndDate);
                                                // console.log(selectedMonthData);
                                                var sortedData = selectedMonthData.sort(function (a, b) {
                                                    return parseInt(a.day) - parseInt(b.day);
                                                });
                                                // console.log(sortedData);
                                                for (var n = 0; n < sortedData.length; n++) {
                                                    console.log(parseInt(sortedData[n].day));
                                                    if (parseInt(sortedData[n].day) >= weeklyStartDate) {
                                                        // console.log("1");
                                                        console.log("first if called");
                                                        if (parseInt(sortedData[n].day) <= weekEndDate) {
                                                            // console.log("2");
                                                            console.log("second if called");
                                                            dayData = sortedData[n].dayData.time;
                                                            if (dayData != "") {
                                                                console.log(dayData);
                                                                count = count + parseInt(dayData);
                                                                console.log("count");
                                                                // payRollArray.push({ coun: count });
                                                                for (var s = 0; s < payRollArray.length; s++) {
                                                                    if (employeeid == payRollArray[s].EmployeeID) {
                                                                        console.log("same employee id");
                                                                        payRollArray[s].totalHours = count;
                                                                    } else {
                                                                        console.log("not same employee id")
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            } else if (payType == "Bi-Weekly") {
                                                count = 0;
                                                console.log("selected pay type is bi-weekly");
                                                var weeklyStartDate;
                                                if (payMonth[5] == "-") {
                                                    weeklyStartDate = payMonth.substring(4, 5);
                                                } else {
                                                    weeklyStartDate = payMonth.substring(4, 6);
                                                }
                                                console.log("weekly start date is:" + weeklyStartDate);
                                                var weekEndDate = parseInt(weeklyStartDate) + 14;
                                                console.log("weekly end date is:" + weekEndDate);
                                                // console.log(selectedMonthData);
                                                var sortedData = selectedMonthData.sort(function (a, b) {
                                                    return parseInt(a.day) - parseInt(b.day);
                                                });
                                                // console.log(sortedData);
                                                for (var n = 0; n < sortedData.length; n++) {
                                                    console.log(parseInt(sortedData[n].day));
                                                    if (parseInt(sortedData[n].day) >= weeklyStartDate) {
                                                        // console.log("1");
                                                        console.log("first if called");
                                                        if (parseInt(sortedData[n].day) <= weekEndDate) {
                                                            // console.log("2");
                                                            console.log("second if called");
                                                            var dayData = sortedData[n].dayData.time;
                                                            if (dayData != "") {
                                                                console.log(dayData);
                                                                count = count + parseInt(dayData);
                                                                console.log("count");
                                                                // payRollArray.push({ coun: count });
                                                                for (var s = 0; s < payRollArray.length; s++) {
                                                                    if (employeeid == payRollArray[s].EmployeeID) {
                                                                        console.log("same employee id");
                                                                        payRollArray[s].totalHours = count;
                                                                    } else {
                                                                        console.log("not same employee id")
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        // statusCode = 21;
                                        // console.log("workinghours");console.log(docs[i].workingHours);
                                    } else {
                                        console.log("no data present in the selected month");
                                        // statusCode = "05";
                                        // message = "No data present in the selected month";
                                        // res.json({Message:message,StatusCode:statusCode});
                                    }
                                }
                                // statusCode = 11;
                            } else {
                                // statusCode = "03";
                                console.log("no data present in the selected year");
                                // message = "No data present in the selected year";
                                // res.json({StatusCode:statusCode,Message:message});
                            }
                        }
                    }
                    res.json({ PayRollArray: payRollArray, Message: message, StatusCode: '00' });
                } else {
                    console.log("No Data is present in timesheet");
                    statusCode = "11";
                    message = "No data present in the timesheet";
                    res.json({ Message: message, StatusCode: statusCode });
                }
            });

        } else {
            console.log("No data is present");
            statusCode = "01";
            message = "No employees are with the selected paytype :" + payType;
            res.json({ Message: message, StatusCode: statusCode });
        }
    })
}