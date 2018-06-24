const express = require('express');

const employeeRouter = express.Router();


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    id = employeeId;
    db.get('SELECT * FROM Employee WHERE Employee.id = $nid',
        {
            $nid: id
        },
        (err, employee) => {
            if (err) {
                next("EmployeeRouter.param"+ err)
            } else if (employee) {
                console.log('Employee: ' + employee);
                req.employee = employee;
                next();
            } else {
                res.status(404).send();
            }
        });
})

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);


employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
        (err, employees) => {
            if (err) {
                next(err);
            } else {
                console.log("Employees: "+ employees)
                res.status(200).json({ employees: employees });
            }
        });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee });
});


employeeRouter.post('/', (req, res, next) => {
    for (prop in req.body.employee) {
        console.log('req.body: ' + prop + ', ' + req.body.employee[prop]);
    }
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        is_current_employee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        console.log('name: ' + name + ', position: ' + position);
        res.status(400).send();
    }
    console.log('name: ' + name + ', position: ' + position);
    db.run('INSERT INTO Employee (name, position, wage, is_current_employee) \
            VALUES ($nname, $nposition, $nwage,$ice)',
        {
            $nname: name,
            $nposition: position,
            $nwage: wage,
            $ice: is_current_employee
        }, function (err) {
            if (err) {
                next(err);
            } else {
                db.get("SELECT * FROM Employee WHERE Employee.id = $nid", { $nid: this.lastID },
                    (err, employee) => {
                        if (err) {
                            next(err);
                        } else {
                            console.log("Employee: " + employee);
                            res.status(201).json({ employee: employee });
                        }
                    })
            }
        });
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    //res.status(200).json({ employee: req.employee });
    for (prop in req.body.employee) {
        console.log('req.body: ' + prop + ', ' + req.body.employee[prop]+ ', employeeId: ' + req.params.employeeId);
    }
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        is_current_employee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        res.status(400).send();
    }
    console.log("Employee: " + name, "," + position + "," + wage + "," + req.params.employeeId);
    sql = "UPDATE Employee SET " +
        "name = $nname, position = $nposition, wage = $nwage, is_current_employee = $ice " +
        "WHERE Employee.id = $nid";

    console.log('SQL: ' + sql);
    const values = {
        $nname: name,
        $nposition: position,
        $nwage: wage,
        $ice: is_current_employee,
        $nid: req.params.employeeId
    };
    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
                (error, employee) => {
                    res.status(200).json({ employee: employee });
                });
        }
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    //res.status(200).json({ employee: req.employee });
    for (prop in req.employee) {
        console.log('req.employee: ' + prop + ', ' + req.employee[prop] + ', employeeId: ' + req.params.employeeId);
    }
    const name = req.employee.name,
        position = req.employee.position,
        wage = req.employee.wage,
        is_current_employee = 0 ;
    if (!name || !position || !wage) {
        res.status(400).send();
    }
    console.log("Employee: " + name, "," + position + "," + wage + "," + req.params.employeeId);
    sql = "UPDATE Employee SET " +
        "name = $nname, position = $nposition, wage = $nwage, is_current_employee = $ice " +
        "WHERE Employee.id = $nid";

    console.log('SQL: ' + sql);
    const values = {
        $nname: name,
        $nposition: position,
        $nwage: wage,
        $ice: is_current_employee,
        $nid: req.params.employeeId
    };
    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
                (error, employee) => {
                    res.status(200).json({ employee: employee });
                });
        }
    });
});

module.exports = employeeRouter;
