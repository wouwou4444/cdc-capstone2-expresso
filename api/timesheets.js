const express = require('express');

const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
//    const sql = "SELECT * FROM Timesheet WHERE Timesheet.employee_id = $neid AND Timesheet.id=$nid";
    const sql = "SELECT * FROM Timesheet WHERE  Timesheet.id=$nid";
    const values = { $nid: timesheetId }

    console.log('Timesheet.id: ' + timesheetId + ", " + req.params.employeeId)
    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            req.timesheet = timesheet;
            console.log('Timesheet.id: ' + req.timesheet.id + ", " + req.timesheet.employee_id)
            next();
        } else {
            console.log("No time sheet found");
            res.status(404).send();
        }
    })
});

timesheetsRouter.get('/', (req, res, next) => {
    const values = {
        $neid: req.params.employeeId
    };
    const sql = "SELECT * FROM Timesheet WHERE Timesheet.employee_id = $neid";
    db.all(sql, values, (err, timesheets) => {
        if (err) {
            next(err);
        }
        res.status(200).json({timesheets: timesheets})
    });
});


////
timesheetsRouter.post('/', (req, res, next) => {
    for (prop in req.body.timesheet) {
        console.log('req.body: ' + prop + ', ' + req.body.timesheet[prop]);
    }
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employee_id = req.params.employeeId;
    if (!hours || !date || !rate) {
        console.log('hours: ' + hours + ', date: ' + date);
        res.status(400).send();
    }
    console.log('hours: ' + hours + ', date: ' + date);
    db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) \
            VALUES ($nhours, $nrate, $ndate,$neid)',
        {
            $nhours: hours,
            $nrate: rate,
            $ndate: date,
            $neid: employee_id
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM Timesheet WHERE Timesheet.id = $nid", { $nid: this.lastID },
                    (err, timesheet) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("timesheet: " + timesheet);
                            res.status(201).json({ timesheet: timesheet });
                        }
                    })
            }
        });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    for (prop in req.body.timesheet) {
        console.log('req.body: ' + prop + ', ' + req.body.timesheet[prop]);
    }
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

    if (!hours || !rate || !date) {
        res.status(400).send();
    }
    const values = {
        $nhours: hours,
        $nrate: rate,
        $ndate: date,
        $nid: req.params.timesheetId
    };
    const sql = "UPDATE Timesheet SET hours = $nhours, " +
        "rate = $nrate, date = $ndate " +
        "WHERE Timesheet.id= $nid ";
    console.log('SQL: ' + sql);
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get("SELECT * FROM Timesheet WHERE Timesheet.id = $nid",
                { $nid: req.params.timesheetId },
                (err, timesheet) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({ timesheet: timesheet })
                    }
                }
            )
            
        }
    });
});


timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    console.log('Test');
    const sql = "DELETE FROM Timesheet WHERE Timesheet.id = $nid";
    console.log('SQL: ' + sql);
    const values = { $nid: req.params.timesheetId };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});



module.exports = timesheetsRouter;

