var express = require('express');
var router = express.Router();

var timesheetController = require('../controllers/timesheet');

/* Post Action for Employee Login. */
router.post('/add', function(req, res, next) {
   timesheetController.insertData(req,res);
});

router.get('/getdata/:id', function(req, res, next) {
   timesheetController.getData(req, res);
});
router.post("/generatePayRoll" , function(req,res,next){
  timesheetController.generatePayRoll(req,res);
});
module.exports = router;
