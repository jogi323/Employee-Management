const uri = "mongodb://empinfo:empinfo@cluster0-shard-00-00.8xam9.mongodb.net:27017,cluster0-shard-00-01.8xam9.mongodb.net:27017,cluster0-shard-00-02.8xam9.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-2q2uo1-shard-0&authSource=admin&retryWrites=true&w=majority";
var EmployeeSchema = require('../model/empschema');
const { MongoClient } = require('mongodb');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
// var xoauth2 = require('xoauth2');
var jwt = require('jsonwebtoken');

var Employee, db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
  db = client.db("EMPINFO");
  Employee = db.collection("Employee");
})
  .catch((err) => {
    console.log(err, "err==================");
  })

exports.login = function (req, res) {
  //console.log(req.body);
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ $and: [{ username: req.body.username }, { password: req.body.password }] }, function (err, data) {
      if (err) {
        throw err;
      } else if (!data) {
        res.json({ code: 0, msg: 'Invalid Credentials' });
      } else {
        var secret = '123456';
        var token = jwt.sign({ data: data }, secret, { expiresIn: 7200 });
        // console.log(token);
        // console.log(data);
        process.env.TOKEN_KEY = token;
        res.json({ code: 1, data: data, token: token });
      }
    })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

//Change Password Action
exports.changePassword = function (req, res) {
  //console.log(req.body.employeeId);
  var oldPassword = req.body.currentpassword;
  var newPassword = req.body.newpassword;
  var confirmPassword = req.body.confirmpassword;
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ password: oldPassword }, function (err, docs) {
      //console.log(docs);
      if (err) {
        throw err;
      } else {
        //console.log(docs);

        if (!docs) {
          // res.json({ success: false, msg: 'Please Fill The All Fields....' });
          res.json({ code: 0, msg: "user not found........." });
        } else {

          const newpswd = req.body.newpassword;
          const cpswd = req.body.confirmpassword;
          if (newpswd != cpswd) {
            res.json({ code: 1, success: false, msg: 'password does not match....' });
            console.log("Password does not match")
          } else {
            console.log(newPassword)
            Employee.findOneAndUpdate({ employeeId: req.body.employeeId }, { $set: { password: newPassword, firstLogin: false } }, function (err, docs) {
              if (err) {
                res.json({ code: 2, success: false, msg: 'User not updated' });
              } else {
                res.json({ code: 3, success: true, msg: 'password updated Successfully' });
              }

            }) //update closing
          } //else close
        } //
      } //find else closing
    }) //find closing
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

//Reset Password
exports.resetPassword = function (req, res) {
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    if (req.body.email) {
      Employee.findByIdAndUpdate({ personalEmail: req.body.email }, { $set: { password: req.body.newpassword } }, function (err, data) {
        if (err) {
          throw err;
        } else {
          res.json({ code: 0, msg: "password updated successfully" });
        }
      });
    } else {
      res.json({ code: 1, msg: "email not found" });
    }
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

exports.managersList = function (req, res) {
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.find({ role: 'Manager' }).toArray().then((data) => {
      res.json(data);
    })
      .catch((err) => {
        throw err;
      });
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

//Forgot Password
exports.generateOTP = function (req, res) {
  var email = req.body.email;
  var otp = Math.floor(Math.random() * 90000) + 100000;
  //console.log(otp);
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ personalEmail: email }, function (err, data) {
      if (err) {
        throw err;
      } else if (data !== null) {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'empinfo323@gmail.com',
            clientId: '264414123191-o02oin39ppc1kc5ptihh4h887fuhp7km.apps.googleusercontent.com',
            clientSecret: 'x0lbaW_iLQtMJtNhbIBo5Ryp',
            refreshToken: '1//04KOj4G7NvxfJCgYIARAAGAQSNwF-L9IrDAKLcNRHLWXFrjx2Mt592vGhnvP5pH5QMXLYNLSU2RSFSdZHM4uJAMKQgxmmNLqonkU',
            accessToken: 'ya29.a0ARrdaM8WYB4bHn6HJ2RsrMO78wfsLxm408P76en86xjQsQXDzV88ySynoJ_GgcWIPSWhNdC2yGLfoF9740V5M2UOaZ2BKzTFYCevgrmpHq0Ujo0MVQjpZF8kSbc7WXD67fmqhw8FR2qrknXdjw4NnBq_O71b'
          }
        })

        var mailOptions = {
          from: 'admin <empinfo323@gmail.com>',
          to: req.body.email,
          subject: 'OTP to change password.',
          html: '<h3>Dear User,</h3><br>Your OTP is:' + otp + ''
        }

        transporter.sendMail(mailOptions, function (err, res) {
          if (err) {
            console.log('Error' + err);
            throw err;
          } else {
            console.log('Email Sent');
          }
        });
        Employee.findOneAndUpdate({ personalEmail: email }, { $set: { otp: otp } }, function (err, data) {
          if (err) {
            throw err;
          } else {
            res.json({ status: 200, data: otp });
          }
        })

      } else {
        res.json({ status: 404 });
      }
    });
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

//OTP Validation
exports.checkOtp = function (req, res) {
  var email = req.body.email;
  var otp = req.body.otp;
  console.log("cHECK otp" + otp);
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ personalEmail: email, otp: otp }, function (err, data) {
      console.log(data);
      if (err) {
        throw err;
      } else if (data) {
        //console.log(data[0]);
        res.json({ status: 200, msg: 'Valid Otp' });
      } else {
        res.json({ status: 404, msg: 'Invalid Otp' });
      }
    })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

//Reset Password
exports.resetPassword = function (req, res) {
  // console.log(req.body);
  console.log(req.body.email);
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    if (req.body.email) {
      Employee.findOneAndUpdate({ personalEmail: req.body.email }, { $set: { password: req.body.newpassword } }, function (err, data) {
        if (err) {
          throw err;
        } else {
          res.json({ code: 0, msg: "password updated successfully" });
        }
      });
    } else {
      res.json({ code: 1, msg: "email not found" });
    }
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });

}

// Create employee
exports.createEmployee = function (req, res) {
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  var employee = new EmployeeSchema({
    employeeName: req.body.fname + " " + req.body.lname,

    employeeType: req.body.etype,
    role: req.body.erole,
    username: req.body.fname[0].toLowerCase() + req.body.lname.toLowerCase(),
    password: password,
    // department: req.body.department,
    designation: req.body.designation,
    // practice: req.body.practice,
    // workLocation: req.body.workLocation,
    // companyEmail: req.body.companyEmail,
    personalEmail: req.body.email,
    primaryMobile: req.body.mobile1,
    alternateMobile: req.body.mobile2,
    joinedOn: req.body.doj,
    status: req.body.jobstatus,
    dob: req.body.dob,
    address: req.body.address,
    manager: req.body.rmanager,
    payRollType: req.body.epayroll,
    cost: req.body.ctc,
    empImage: req.body.fileName,
    firstLogin: true,
    otp: '',
    status: "Active"
  });
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ employeeId: req.body.rmanager }, function (err, data) {
      // console.log(data[0]);
      if (err) {
        console.log(err);
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      } else {
        if (data != null) {
          employee.reportingTo.push(data._id);
          Employee.find({}, { sort: { employeeId: -1 }, limit: 1 }).toArray().then((data) => {
            employee.employeeId = data && data[0] ? data[0].employeeId + 1 : 1;
            Employee.insertOne(employee, function (err, result) {
              if (err) {
                return res.status(500).json({
                  title: 'An error occurred',
                  error: err
                });
              } else {
                let reportingToHim = Object.assign([], data.reportingToHim);
                reportingToHim.push(result.insertedId);
                Employee.findOneAndUpdate({ employeeId: data.employeeId }, { $set: { reportingToHim: reportingToHim } }, { upsert: true }, function (err, resul) {
                  if (err) {
                    console.log("error in executing query");
                    throw err;
                  }
                  else {
                    console.log("modified data::::");
                    // console.log(resul);
                  }
                });
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    type: 'OAuth2',
                    user: 'empinfo323@gmail.com',
                    clientId: '264414123191-o02oin39ppc1kc5ptihh4h887fuhp7km.apps.googleusercontent.com',
                    clientSecret: 'x0lbaW_iLQtMJtNhbIBo5Ryp',
                    refreshToken: '1//04KOj4G7NvxfJCgYIARAAGAQSNwF-L9IrDAKLcNRHLWXFrjx2Mt592vGhnvP5pH5QMXLYNLSU2RSFSdZHM4uJAMKQgxmmNLqonkU',
                    accessToken: 'ya29.a0ARrdaM8WYB4bHn6HJ2RsrMO78wfsLxm408P76en86xjQsQXDzV88ySynoJ_GgcWIPSWhNdC2yGLfoF9740V5M2UOaZ2BKzTFYCevgrmpHq0Ujo0MVQjpZF8kSbc7WXD67fmqhw8FR2qrknXdjw4NnBq_O71b'
                  }
                })

                var mailOptions = {
                  from: 'admin <empinfo323@gmail.com>',
                  to: req.body.email,
                  subject: 'New Employeement Details',
                  html: '<h3>Hello User<h3><br><br>This is to convey that your are successfully enrolled in our organization. Login to our portal using Username:' + employee.username + '<br> password:' + password + '<br>'
                }
                transporter.sendMail(mailOptions, function (err, res) {
                  if (err) {
                    console.log('Error===========', err);
                  } else {
                    console.log('Email Sent==================================');
                  }
                })
                Employee.findOne({ _id: result.insertedId }, (err, emp) => {
                  if (err) {
                    throw err;
                  } else {
                    res.status(200).json({
                      message: 'User created',
                      user: emp
                    });
                  }
                })

              }
            });
          })
        } else {
          res.status(500).json({
            message: 'manager not  existed',
          });
        }
      }
    });
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

// all employees
exports.allemployees = function (req, res) {
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    db = client.db("EMPINFO");
    Employee = db.collection("Employee");
    Employee.find().toArray().then((data) => {
      res.json({ status: 200, data: data })
    })
      .catch((err) => {
        res.status(500).json({ error: err });
      })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

exports.empdetails = function (req, res) {
  var id = req.params.id;
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ _id: id }, function (err, data) {
      if (err) {
        res.status(500).json({ error: err })
      } else {
        console.log("data=============", data)
        res.json({ code: 0, data: data });
      }
    })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}

exports.myreportees = function (req, res) {
  var id = req.params.id;
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("DeletedEmployees");
    console.log(id)
    Employee.find().toArray().then((employees) => {
      // console.log(employees);
      let reportees = [];
      employees.forEach((emp) => {
        if (emp.reportingTo && emp.reportingTo.includes(id)) {
          reportees.push(emp);
        }
      });
      console.log(reportees);
      res.json({code: 0, data: reportees});
    })
    .catch((err) => {
      console.log("errr", err)
      res.status(500).json({ error: err })
    })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}
exports.deleteEmployee = function (req, res) {
  var id = req.params.id;
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: false }).then((client) => {
    const db = client.db("EMPINFO");
    var Employee = db.collection("Employee");
    Employee.findOne({ _id: id }, function (err, data) {
      if (err) {
        res.status(500).json({ error: err })
      } else {
        console.log("data=============", data)
        res.json({ code: 0, data: data });
      }
    })
  })
    .catch((err) => {
      console.log("errrrrrrrrrrrrrrrrrrrr", err);
      throw err;
    });
}